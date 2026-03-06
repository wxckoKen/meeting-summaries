import { getOpenAIClient, SUMMARY_MODEL } from "./openai";
import type { Transcript, TranscriptSegment } from "@/types";

/**
 * Speaker diarization using GPT-4o.
 *
 * Since OpenAI's Whisper API doesn't natively support speaker diarization,
 * we use a two-pass approach:
 *
 * 1. Whisper transcribes with timestamps (done in transcribe.ts)
 * 2. GPT-4o analyzes the transcript to identify distinct speakers based on
 *    context clues, conversational patterns, and speech style differences.
 *
 * This works surprisingly well for meetings where speakers take turns
 * (which is most meetings). For production use with overlapping speech,
 * consider swapping in a dedicated diarization service like pyannote.audio
 * or AssemblyAI.
 */
export async function diarizeSpeakers(
  transcript: Transcript
): Promise<Transcript> {
  const openai = getOpenAIClient();

  // Build a numbered transcript for GPT to analyze
  const numberedLines = transcript.segments
    .map(
      (seg, i) =>
        `[${i}] (${formatTime(seg.startTime)}-${formatTime(seg.endTime)}) ${seg.text}`
    )
    .join("\n");

  const response = await openai.chat.completions.create({
    model: SUMMARY_MODEL,
    temperature: 0.1, // low temperature for consistency
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a speaker diarization expert. Analyze this transcript and identify distinct speakers.

RULES:
- Assign each segment a speaker label like "Speaker 1", "Speaker 2", etc.
- Use contextual clues: greetings, names mentioned, topic shifts, speech patterns
- If a speaker's name is mentioned (e.g. "Thanks, Sarah"), use their actual name
- Consecutive segments by the same speaker should share the same label
- Be conservative: if uncertain, keep the same speaker as the previous segment

Return JSON in this exact format:
{
  "speakers": ["Speaker 1", "Speaker 2"],
  "assignments": [
    { "index": 0, "speaker": "Speaker 1" },
    { "index": 1, "speaker": "Speaker 2" }
  ]
}`,
      },
      {
        role: "user",
        content: `Analyze this transcript and identify speakers:\n\n${numberedLines}`,
      },
    ],
  });

  try {
    const result = JSON.parse(response.choices[0].message.content || "{}");
    const speakerMap = new Map<number, string>();

    for (const assignment of result.assignments || []) {
      speakerMap.set(assignment.index, assignment.speaker);
    }

    // Apply speaker labels to segments
    const diarizedSegments: TranscriptSegment[] = transcript.segments.map(
      (seg, i) => ({
        ...seg,
        speaker: speakerMap.get(i) || `Speaker ${i + 1}`,
      })
    );

    // Merge consecutive segments from the same speaker
    const merged = mergeConsecutiveSpeakerSegments(diarizedSegments);

    return {
      ...transcript,
      segments: merged,
      speakers: result.speakers || extractUniqueSpeakers(merged),
    };
  } catch {
    // Fallback: return transcript with generic speaker labels
    console.warn("Diarization parsing failed, using fallback labels");
    return {
      ...transcript,
      speakers: ["Speaker 1"],
      segments: transcript.segments.map((seg) => ({
        ...seg,
        speaker: "Speaker 1",
      })),
    };
  }
}

/** Merge consecutive segments from the same speaker into one */
function mergeConsecutiveSpeakerSegments(
  segments: TranscriptSegment[]
): TranscriptSegment[] {
  if (segments.length === 0) return [];

  const merged: TranscriptSegment[] = [{ ...segments[0] }];

  for (let i = 1; i < segments.length; i++) {
    const prev = merged[merged.length - 1];
    const curr = segments[i];

    if (curr.speaker === prev.speaker) {
      // Same speaker — merge text and extend time range
      prev.text += " " + curr.text;
      prev.endTime = curr.endTime;
    } else {
      merged.push({ ...curr });
    }
  }

  return merged;
}

function extractUniqueSpeakers(segments: TranscriptSegment[]): string[] {
  return [...new Set(segments.map((s) => s.speaker))];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
