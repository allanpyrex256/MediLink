import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { sendWhatsApp } from "@/lib/notifications/whatsapp";

const whatsappTestSchema = z.object({
  to: z.string().min(7),
  body: z.string().min(1).max(1000).optional(),
});

const defaultMessage =
  "MediLink WhatsApp test: your integration is working.";

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = whatsappTestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid WhatsApp recipient number.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const result = await sendWhatsApp({
      to: parsed.data.to,
      body: parsed.data.body ?? defaultMessage,
    });

    return NextResponse.json({
      data: {
        sent: true,
        result,
      },
    });
  } catch (caught) {
    return NextResponse.json(
      {
        error:
          caught instanceof Error
            ? caught.message
            : "Unable to send WhatsApp test message.",
      },
      { status: 502 },
    );
  }
}
