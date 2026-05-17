"use client";

import { Bot, Send, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Ask MediLink AI about today’s clinic flow, revenue, or appointment bottlenecks.",
    },
  ]);

  function submit() {
    if (!message.trim()) return;
    setMessages((current) => [
      ...current,
      { role: "user", text: message },
      {
        role: "assistant",
        text: "AI insights are ready to connect here. The tenant context, role, and clinic data contract are already in place.",
      },
    ]);
    setMessage("");
  }

  return (
    <>
      <Button
        className="fixed bottom-5 right-5 z-40 shadow-lg shadow-sky-200"
        onClick={() => setOpen(true)}
        title="Ask MediLink AI"
      >
        <Bot className="size-4" />
        Ask AI
      </Button>
      {open ? (
        <div className="fixed inset-x-4 bottom-20 z-50 mx-auto max-w-md rounded-lg border border-slate-200 bg-white shadow-2xl shadow-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 p-4">
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-lg bg-sky-50 text-sky-700">
                <Bot className="size-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-950">MediLink AI</p>
                <p className="text-xs text-slate-500">Tenant-aware assistant placeholder</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close AI assistant">
              <X className="size-4" />
            </Button>
          </div>
          <div className="max-h-80 space-y-3 overflow-y-auto p-4">
            {messages.map((item, index) => (
              <div
                key={`${item.role}-${index}`}
                className={
                  item.role === "assistant"
                    ? "mr-8 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700"
                    : "ml-8 rounded-lg bg-sky-600 p-3 text-sm leading-6 text-white"
                }
              >
                {item.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2 border-t border-slate-100 p-4">
            <Input
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") submit();
              }}
              placeholder="Ask about clinic operations"
              aria-label="Ask MediLink AI"
            />
            <Button size="icon" onClick={submit} aria-label="Send AI message">
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
