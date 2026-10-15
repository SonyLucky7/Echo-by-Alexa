import { NextRequest, NextResponse } from "next/server";
import { getOrCreateSession } from "@/lib/session";
import { processConciergeTurn } from "@/lib/concierge/engine";
import { SupportedLocale } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await getOrCreateSession();
    const body = await req.json();

    const message = body.message;
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const locale: SupportedLocale = (body.locale || "en") as SupportedLocale;

    const response = await processConciergeTurn(message.trim(), {
      sessionId,
      locale,
    });

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Concierge API error:", error);
    return NextResponse.json(
      {
        error: "Our dining concierge is currently attending to the floor. Please try again in a moment.",
        details: error?.message,
      },
      { status: 500 }
    );
  }
}
