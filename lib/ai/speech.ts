"use server";

import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

/**
 * Convert text to speech using official ElevenLabs SDK
 * Returns a base64 string of the audio content
 */
export async function textToSpeech(text: string): Promise<string | null> {
  const API_KEY = (process.env.ELEVENLABS_API_KEY || process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY || "").trim();
  
  if (!API_KEY) {
    console.error("ELEVENLABS_API_KEY is missing in .env");
    return null;
  }

  const client = new ElevenLabsClient({
    apiKey: API_KEY,
  });

  try {
    const audioStream = await client.textToSpeech.convert(
      "JBFqnCBsd6RMkjVDRZzb", // George
      {
        text: text,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
      }
    );

    // Convert readable stream to Buffer using a reader
    const chunks: Uint8Array[] = [];
    const reader = (audioStream as any).getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    
    const audioBuffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));
    return audioBuffer.toString("base64");
  } catch (error: any) {
    console.error("ElevenLabs SDK Error:", error.message);
    return null;
  }
}
