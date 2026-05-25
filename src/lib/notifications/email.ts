import { appConfig } from "@/lib/config";
import { connect, type TLSSocket } from "node:tls";

export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(message: EmailMessage) {
  if (hasSmtpConfig()) {
    return sendSmtpEmail(message);
  }

  if (!appConfig.email.resendApiKey) {
    return {
      queued: true,
      provider: "demo",
      reason: "RESEND_API_KEY is not configured",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${appConfig.email.resendApiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "medilink/1.0",
    },
    body: JSON.stringify({
      from: appConfig.email.from,
      ...message,
    }),
  });

  if (!response.ok) {
    const providerMessage = await response
      .json()
      .then((payload) => providerErrorMessage(payload))
      .catch(() => "");

    throw new Error(friendlyEmailProviderError(response.status, providerMessage));
  }

  return response.json();
}

function hasSmtpConfig() {
  const smtp = appConfig.email.smtp;

  return Boolean(smtp.host && smtp.user && smtp.pass);
}

async function sendSmtpEmail(message: EmailMessage) {
  const smtp = appConfig.email.smtp;
  const from = smtp.from || appConfig.email.from;
  const fromEmail = parseEmailAddress(from);
  const recipients = message.to
    .split(",")
    .map((recipient) => parseEmailAddress(recipient))
    .filter(Boolean);

  if (!smtp.secure) {
    throw new Error("SMTP email delivery requires SMTP_SECURE=true on port 465.");
  }

  if (!fromEmail) {
    throw new Error("SMTP_FROM or EMAIL_FROM must include a valid email address.");
  }

  if (!recipients.length) {
    throw new Error("Email recipient is missing.");
  }

  const socket = await connectSmtp(smtp.host, smtp.port || 465);

  try {
    await readSmtpResponse(socket, [220]);
    await sendSmtpCommand(socket, "EHLO medilink.local", [250]);
    await sendSmtpCommand(
      socket,
      `AUTH PLAIN ${Buffer.from(`\0${smtp.user}\0${smtp.pass}`).toString("base64")}`,
      [235],
    );
    await sendSmtpCommand(socket, `MAIL FROM:<${fromEmail}>`, [250]);

    for (const recipient of recipients) {
      await sendSmtpCommand(socket, `RCPT TO:<${recipient}>`, [250, 251]);
    }

    await sendSmtpCommand(socket, "DATA", [354]);
    socket.write(`${formatSmtpMessage({ ...message, from })}\r\n.\r\n`);
    await readSmtpResponse(socket, [250]);
    await sendSmtpCommand(socket, "QUIT", [221]);

    return {
      queued: true,
      provider: "smtp",
    };
  } finally {
    socket.destroy();
  }
}

function connectSmtp(host: string, port: number) {
  return new Promise<TLSSocket>((resolve, reject) => {
    const socket = connect({ host, port, servername: host }, () => resolve(socket));

    socket.setTimeout(20_000);
    socket.once("timeout", () => reject(new Error("SMTP connection timed out.")));
    socket.once("error", reject);
  });
}

function sendSmtpCommand(
  socket: TLSSocket,
  command: string,
  expectedCodes: number[],
) {
  socket.write(`${command}\r\n`);

  return readSmtpResponse(socket, expectedCodes);
}

function readSmtpResponse(socket: TLSSocket, expectedCodes: number[]) {
  return new Promise<string>((resolve, reject) => {
    let response = "";

    function cleanup() {
      socket.off("data", onData);
      socket.off("error", onError);
      socket.off("timeout", onTimeout);
    }

    function onData(chunk: Buffer) {
      response += chunk.toString("utf8");
      const lines = response.split(/\r?\n/).filter(Boolean);
      const lastLine = lines.at(-1) ?? "";
      const complete = /^\d{3} /.test(lastLine);

      if (!complete) return;

      cleanup();

      const statusCode = Number(lastLine.slice(0, 3));
      if (!expectedCodes.includes(statusCode)) {
        reject(new Error(friendlySmtpError(statusCode, lastLine)));
        return;
      }

      resolve(response);
    }

    function onError(error: Error) {
      cleanup();
      reject(error);
    }

    function onTimeout() {
      cleanup();
      reject(new Error("SMTP server response timed out."));
    }

    socket.on("data", onData);
    socket.once("error", onError);
    socket.once("timeout", onTimeout);
  });
}

function formatSmtpMessage({
  from,
  html,
  subject,
  to,
}: EmailMessage & { from: string }) {
  const headers = [
    `From: ${sanitizeHeader(from)}`,
    `To: ${sanitizeHeader(to)}`,
    `Subject: ${sanitizeHeader(subject)}`,
    "MIME-Version: 1.0",
    "Content-Type: text/html; charset=UTF-8",
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@medilink.local>`,
  ];
  const body = html.replace(/\r?\n\./g, "\n..");

  return `${headers.join("\r\n")}\r\n\r\n${body}`;
}

function parseEmailAddress(value: string) {
  const trimmed = value.trim();
  const bracketMatch = /<([^<>@\s]+@[^<>\s]+)>/.exec(trimmed);
  if (bracketMatch) return bracketMatch[1];

  const plainMatch = /^[^@\s<>]+@[^@\s<>]+$/.exec(trimmed);
  return plainMatch ? trimmed : "";
}

function sanitizeHeader(value: string) {
  return value.replace(/[\r\n]+/g, " ").trim();
}

function providerErrorMessage(payload: unknown) {
  if (!payload || typeof payload !== "object") return "";

  const record = payload as Record<string, unknown>;
  const message = record.message ?? record.error;

  return typeof message === "string" ? message : "";
}

function friendlyEmailProviderError(status: number, providerMessage: string) {
  if (status === 403) {
    const details = providerMessage ? ` ${providerMessage}` : "";

    return `Email provider rejected the sender or recipient.${details} Verify the sending domain in Resend, then set EMAIL_FROM to an address on that verified domain.`;
  }

  return providerMessage
    ? `Email provider failed with ${status}: ${providerMessage}`
    : `Email provider failed with ${status}.`;
}

function friendlySmtpError(statusCode: number, response: string) {
  if (statusCode === 535) {
    return "SMTP login failed. Check SMTP_USER and SMTP_PASS. For Gmail, use an app password instead of your normal Gmail password.";
  }

  if (statusCode === 550 || statusCode === 553) {
    return `SMTP rejected the sender or recipient. ${response}`;
  }

  return `SMTP email failed with ${statusCode}: ${response}`;
}
