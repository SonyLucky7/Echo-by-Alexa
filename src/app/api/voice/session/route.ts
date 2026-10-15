import { NextRequest, NextResponse } from "next/server";
import { getConfig, hasVoiceProvider } from "@/lib/config";

export async function GET(req: NextRequest) {
  try {
    const config = getConfig();

    // If agent ID and ElevenLabs API key are configured, request official signed URL
    if (config.elevenLabsKey && config.elevenLabsAgentId) {
      try {
        const resp = await fetch(
          `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${config.elevenLabsAgentId}`,
          {
            headers: {
              "xi-api-key": config.elevenLabsKey,
            },
          }
        );

        if (resp.ok) {
          const data = await resp.json();
          return NextResponse.json({
            provider: "elevenlabs-convai",
            signedUrl: data.signed_url,
            voiceId: config.elevenLabsVoiceId || "sXSV9RZ095VZyL64w3ap",
          });
        }
      } catch (e) {
        console.warn("Could not retrieve ElevenLabs signed URL, falling back to TTS/WebSpeech:", e);
      }
    }

    // If ElevenLabs key exists for TTS
    if (config.elevenLabsKey) {
      return NextResponse.json({
        provider: "elevenlabs-tts",
        voiceId: config.elevenLabsVoiceId || "sXSV9RZ095VZyL64w3ap",
      });
    }

    // Zero-credential or offline fallback
    return NextResponse.json({
      provider: "webspeech",
      voiceId: "sXSV9RZ095VZyL64w3ap",
      note: "Standard Web Speech API fallback active with zero credentials required",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Voice session initialization error", details: error?.message },
      { status: 500 }
    );
  }
}
