import { NextRequest, NextResponse } from "next/server";
import {
  CreateChatTokenCommand,
  ChatTokenCapability,
} from "@aws-sdk/client-ivschat";
import { ivsChatClient } from "@/lib/ivschat";

export async function POST(req: NextRequest) {
  try {
    const { userId, displayName, isModerator } = await req.json();

    if (!userId || !displayName) {
      return NextResponse.json(
        { error: "userId and displayName are required" },
        { status: 400 }
      );
    }

    const roomArn = process.env.NEXT_PUBLIC_IVS_CHAT_ROOM_ARN;
    if (!roomArn) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_IVS_CHAT_ROOM_ARN not set" },
        { status: 500 }
      );
    }

    // Capabilities: SEND_MESSAGE for normal user,
    // extra powers for "moderator"
    const capabilities: ChatTokenCapability[] = ["SEND_MESSAGE"];
    if (isModerator) {
      capabilities.push("DELETE_MESSAGE", "DISCONNECT_USER");
    }

    const cmd = new CreateChatTokenCommand({
      roomIdentifier: roomArn,
      userId: String(userId),
      capabilities,
      attributes: {
        displayName: String(displayName),
      },
      sessionDurationInMinutes: 60,
    });

    const res = await ivsChatClient.send(cmd);

    // res.token, res.sessionExpirationTime, res.tokenExpirationTime
    return NextResponse.json({
      token: res.token,
      sessionExpirationTime: res.sessionExpirationTime,
      tokenExpirationTime: res.tokenExpirationTime,
    });
  } catch (err) {
    console.error("CreateChatToken error:", err);
    return NextResponse.json(
      { error: "Failed to create chat token" },
      { status: 500 }
    );
  }
}

