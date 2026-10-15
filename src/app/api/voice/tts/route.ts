import { NextRequest, NextResponse } from "next/server";
import { getConfig } from "@/lib/config";

export async function POST(req: NextRequest) {
  try {
    const config = getConfig();
    if (!config.elevenLabsKey) {
      return NextResponse.json(
        { error: "ElevenLabs API key not configured; use Web Speech API fallback" },
        { status: 503 }
      );
    }

    const { text, locale = "en" } = await req.json();
    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const voiceId = config.elevenLabsVoiceId || "sXSV9RZ095VZyL64w3ap";

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": config.elevenLabsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.8,
            style: 0.0,
            use_speaker_boost: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: "ElevenLabs synthesis failed", details: errText },
        { status: response.status }
      );
    }

    const audioBuffer = await response.arrayBuffer();
    return new NextResponse(audioBuffer, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "TTS error", details: error?.message },
      { status: 500 }
    );
  }
}
