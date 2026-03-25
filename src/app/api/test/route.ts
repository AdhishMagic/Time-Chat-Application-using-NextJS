import { NextResponse } from "next/server";

import { getServerTimeMessage } from "@/services/chat.service";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message: getServerTimeMessage(),
  });
}
