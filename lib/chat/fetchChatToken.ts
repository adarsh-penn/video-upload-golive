// lib/chat/fetchChatToken.ts
export type ChatTokenResponse = {
    token: string;
    sessionExpirationTime: string;
    tokenExpirationTime: string;
  };
  
  export async function fetchChatToken(userId: string, displayName: string) {
    const res = await fetch("/api/chat/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, displayName }),
    });
  
    if (!res.ok) {
      throw new Error("Failed to get chat token");
    }
  
    const data: ChatTokenResponse = await res.json();
  
    return {
      token: data.token,
      sessionExpirationTime: new Date(data.sessionExpirationTime),
      tokenExpirationTime: new Date(data.tokenExpirationTime),
    };
  }
  
  