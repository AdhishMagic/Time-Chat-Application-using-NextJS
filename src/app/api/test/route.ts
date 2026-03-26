import { NextResponse, NextRequest } from "next/server";

import { getServerTimeMessage } from "@/services/chat.service";
import { connectDB } from "@/core/db";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    // Connect to MongoDB
    await connectDB();

    // Get connection state
    const connectionState = mongoose.connection.readyState;
    const stateMap: Record<number, string> = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    return NextResponse.json(
      {
        ok: true,
        message: getServerTimeMessage(),
        database: {
          connected: connectionState === 1,
          state: stateMap[connectionState] || "unknown",
          timestamp: new Date().toISOString(),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API test route error:", error);
    return NextResponse.json(
      {
        ok: false,
        message: getServerTimeMessage(),
        error: error instanceof Error ? error.message : "Database connection failed",
      },
      { status: 500 }
    );
  }
}

/**
 * Example POST route that would use database models
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      console.error("POST error: Invalid JSON", error);
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid JSON in request body",
        },
        { status: 400 }
      );
    }

    // Example: You would use your Mongoose models here
    // const result = await YourModel.create(body);

    return NextResponse.json(
      {
        ok: true,
        message: "POST request handled successfully",
        data: body,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Request failed",
      },
      { status: 500 }
    );
  }
}
