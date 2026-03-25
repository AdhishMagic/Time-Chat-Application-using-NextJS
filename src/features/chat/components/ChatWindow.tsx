"use client";

import { useState } from "react";

type Message = {
  id: string;
  role: "user" | "system";
  content: string;
};

type ChatWindowProps = {
  initialMessage: string;
};

export default function ChatWindow({ initialMessage }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system-1",
      role: "system",
      content: initialMessage,
    },
  ]);
  const [text, setText] = useState("");

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const value = text.trim();
    if (!value) {
      return;
    }

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: value },
    ]);
    setText("");
  };

  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 p-6">
      <h1 className="text-2xl font-semibold">Chat</h1>
      <div className="min-h-64 rounded-md border p-4">
        <ul className="space-y-2">
          {messages.map((message) => (
            <li key={message.id} className="text-sm">
              <span className="font-medium">{message.role}: </span>
              <span>{message.content}</span>
            </li>
          ))}
        </ul>
      </div>

      <form onSubmit={onSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Type a message"
          className="w-full rounded-md border px-3 py-2"
        />
        <button type="submit" className="rounded-md border px-4 py-2">
          Send
        </button>
      </form>
    </section>
  );
}
