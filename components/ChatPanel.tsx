"use client";

import { useEffect, useState } from "react";
import {
  ChatRoom,
  SendMessageRequest,
  ChatToken,
} from "amazon-ivs-chat-messaging";
import { fetchChatToken } from "@/lib/chat/fetchChatToken";

// Message type from chat room events
type ChatMessage = {
  id: string;
  content: string;
  sender: {
    userId: string;
    attributes?: {
      displayName?: string;
    };
  };
};

const region = process.env.NEXT_PUBLIC_IVS_CHAT_REGION!;

function getOrCreateUserId() {
  if (typeof window === "undefined") return "anonymous";
  const key = "ivs-chat-user-id";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = "user-" + Math.random().toString(36).slice(2, 10);
    window.localStorage.setItem(key, id);
  }
  return id;
}

export default function ChatPanel() {
  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const userId = getOrCreateUserId();
    const displayName = userId; // or ask user for a name

    const tokenProvider = async (): Promise<ChatToken> => {
      return fetchChatToken(userId, displayName);
    };

    const chatRoom = new ChatRoom({
      regionOrUrl: region,
      tokenProvider,
    });

    const unsubConnect = chatRoom.addListener("connect", () => {
      setConnected(true);
    });

    const unsubDisconnect = chatRoom.addListener("disconnect", () => {
      setConnected(false);
    });

    const unsubMessage = chatRoom.addListener("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    chatRoom.connect();
    setRoom(chatRoom);

    return () => {
      unsubConnect();
      unsubDisconnect();
      unsubMessage();
      chatRoom.disconnect();
    };
  }, []);

  async function sendMessage() {
    if (!room || !input.trim()) return;
    try {
      const req = new SendMessageRequest(input.trim());
      await room.sendMessage(req);
      setInput("");
    } catch (err) {
      console.error("Send message failed", err);
    }
  }

  return (
    <div
      style={{
        border: "1px solid #444",
        borderRadius: 8,
        padding: 12,
        height: 400,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ marginBottom: 8, fontWeight: "bold" }}>
        Chat {connected ? "🟢" : "🔴"}
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          marginBottom: 8,
          fontSize: 14,
        }}
      >
        {messages.map((m) => (
          <div key={m.id}>
            <strong>{m.sender.attributes?.displayName || m.sender.userId}:</strong>{" "}
            {m.content}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Type message"
          style={{ flex: 1, padding: 6 }}
        />
        <button onClick={sendMessage} disabled={!connected || !input.trim()}>
          Send
        </button>
      </div>
    </div>
  );
}

