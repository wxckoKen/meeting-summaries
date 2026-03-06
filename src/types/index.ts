// ─── Core domain types for the meeting summarizer ───────

/** A single utterance attributed to a speaker */
export interface TranscriptSegment {
  speaker: string; // e.g. "Speaker 1", "Alice"
  text: string;
  startTime: number; // seconds from start
  endTime: number;
}

/** Full transcript with speaker-labeled segments */
export interface Transcript {
  segments: TranscriptSegment[];
  speakers: string[];
  durationSeconds: number;
  rawText: string;
}

/** A single action item / to-do extracted from the meeting */
export interface ActionItem {
  task: string;
  assignee: string | null; // speaker who owns this, if identifiable
  deadline: string | null; // mentioned deadline, if any
  priority: "high" | "medium" | "low";
}

/** The full AI-generated summary output */
export interface MeetingSummary {
  id: string;
  title: string; // AI-generated meeting title
  date: string;
  duration: string; // human-readable, e.g. "42 minutes"
  speakers: string[];

  // High-level overview (2-3 sentences)
  executiveSummary: string;

  // Detailed discussion points grouped by topic
  detailedPoints: {
    topic: string;
    points: string[];
    speakers: string[]; // who contributed to this topic
  }[];

  // Key takeaways (bulleted insights)
  keyTakeaways: string[];

  // Action items / to-dos
  actionItems: ActionItem[];

  // Full speaker-labeled transcript
  transcript: Transcript;
}

/** Processing status sent to the frontend via polling */
export interface ProcessingStatus {
  id: string;
  stage: "uploading" | "transcribing" | "diarizing" | "summarizing" | "complete" | "error";
  progress: number; // 0-100
  message: string;
  result?: MeetingSummary;
  error?: string;
}

/** Accepted audio MIME types */
export const ACCEPTED_AUDIO_TYPES = [
  "audio/mpeg", // .mp3
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/m4a",
  "audio/x-m4a",
  "audio/mp4",
  "audio/ogg",
  "audio/webm",
] as const;

export const MAX_FILE_SIZE_MB = 50;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
