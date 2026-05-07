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
    const audio = await client.textToSpeech.convert(
      "JBFqnCBsd6RMkjVDRZzb", // George
      {
        text: text,
        modelId: "eleven_multilingual_v2",
        outputFormat: "mp3_44100_128",
      }
    );

    // Convert readable stream to Buffer using a reader
    const chunks: Uint8Array[] = [];
    const reader = audio.getReader();
    
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }
    
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combinedBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combinedBuffer.set(chunk, offset);
      offset += chunk.length;
    }
    
    return Buffer.from(combinedBuffer).toString('base64');
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("ElevenLabs SDK Error:", errorMsg);
    return null;
  }
}
