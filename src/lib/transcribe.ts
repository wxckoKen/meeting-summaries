import { createReadStream } from "fs";
import { getOpenAIClient, WHISPER_MODEL } from "./openai";
import type { Transcript, TranscriptSegment } from "@/types";

/**
 * Transcribe an audio file using OpenAI Whisper with word-level timestamps.
 *
 * We request `verbose_json` format which returns segments with timestamps.
 * Then we run a speaker-diarization pass over those segments to assign
 * speaker labels (see diarize.ts).
 */
export async function transcribeAudio(filePath: string): Promise<Transcript> {
  const openai = getOpenAIClient();

  // Step 1: Get detailed transcription with timestamps
  const response = await openai.audio.transcriptions.create({
    file: createReadStream(filePath) as any,
    model: WHISPER_MODEL,
    response_format: "verbose_json",
    timestamp_granularities: ["segment"],
  });

  const whisperSegments = (response as any).segments || [];
  const duration = (response as any).duration || 0;

  // Step 2: Convert Whisper segments into our format (pre-diarization)
  const segments: TranscriptSegment[] = whisperSegments.map(
    (seg: any, i: number) => ({
      speaker: `Speaker`, // placeholder — diarize.ts assigns real labels
      text: seg.text.trim(),
      startTime: seg.start,
      endTime: seg.end,
    })
  );

  return {
    segments,
    speakers: [],
    durationSeconds: duration,
    rawText: (response as any).text || segments.map((s) => s.text).join(" "),
  };
}
