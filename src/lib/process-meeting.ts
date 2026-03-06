import { transcribeAudio } from "./transcribe";
import { diarizeSpeakers } from "./diarize";
import { generateSummary } from "./summarize";
import type { MeetingSummary, ProcessingStatus } from "@/types";

/**
 * In-memory store for processing jobs.
 *
 * In production, replace this with Redis or a database.
 * This keeps the scaffold simple while being easy to swap out.
 */
const jobs = new Map<string, ProcessingStatus>();

export function getJob(id: string): ProcessingStatus | undefined {
  return jobs.get(id);
}

export function setJob(id: string, status: ProcessingStatus): void {
  jobs.set(id, status);
}

/**
 * Full processing pipeline: upload → transcribe → diarize → summarize.
 *
 * Runs asynchronously so the API can return immediately and the client
 * can poll for progress updates.
 */
export async function processMeeting(
  jobId: string,
  filePath: string
): Promise<void> {
  try {
    // Stage 1: Transcription
    setJob(jobId, {
      id: jobId,
      stage: "transcribing",
      progress: 15,
      message: "Transcribing audio with Whisper...",
    });
    const rawTranscript = await transcribeAudio(filePath);

    // Stage 2: Speaker diarization
    setJob(jobId, {
      id: jobId,
      stage: "diarizing",
      progress: 45,
      message: "Identifying speakers...",
    });
    const diarizedTranscript = await diarizeSpeakers(rawTranscript);

    // Stage 3: AI Summarization
    setJob(jobId, {
      id: jobId,
      stage: "summarizing",
      progress: 70,
      message: "Generating summary, takeaways, and action items...",
    });
    const summary: MeetingSummary = await generateSummary(diarizedTranscript);

    // Done!
    setJob(jobId, {
      id: jobId,
      stage: "complete",
      progress: 100,
      message: "Summary complete!",
      result: summary,
    });
  } catch (error: any) {
    console.error(`[processMeeting] Job ${jobId} failed:`, error);
    setJob(jobId, {
      id: jobId,
      stage: "error",
      progress: 0,
      message: "Processing failed",
      error: error.message || "An unexpected error occurred",
    });
  }
}
