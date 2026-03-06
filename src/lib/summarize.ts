import { getOpenAIClient, SUMMARY_MODEL } from "./openai";
import type { Transcript, MeetingSummary, ActionItem } from "@/types";
import { v4 as uuidv4 } from "uuid";

/**
 * Generate a structured meeting summary from a diarized transcript.
 *
 * Produces:
 * - Executive summary (high-level overview)
 * - Detailed discussion points grouped by topic
 * - Key takeaways
 * - Action items / to-dos with assignees and priorities
 */
export async function generateSummary(
  transcript: Transcript
): Promise<MeetingSummary> {
  const openai = getOpenAIClient();

  // Build the speaker-labeled transcript for the prompt
  const formattedTranscript = transcript.segments
    .map(
      (seg) =>
        `[${formatTime(seg.startTime)}] ${seg.speaker}: ${seg.text}`
    )
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: SUMMARY_MODEL,
    temperature: 0.3,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an expert meeting analyst. Analyze the transcript and produce a comprehensive, well-structured summary.

Return JSON in this EXACT format:
{
  "title": "Short descriptive title for this meeting",
  "executiveSummary": "2-3 sentence high-level overview of what was discussed and decided",
  "detailedPoints": [
    {
      "topic": "Topic or agenda item name",
      "points": ["Detailed point 1", "Detailed point 2"],
      "speakers": ["Names of speakers who contributed to this topic"]
    }
  ],
  "keyTakeaways": [
    "Important insight or decision 1",
    "Important insight or decision 2"
  ],
  "actionItems": [
    {
      "task": "What needs to be done",
      "assignee": "Who should do it (or null if unclear)",
      "deadline": "When it's due (or null if not mentioned)",
      "priority": "high | medium | low"
    }
  ]
}

GUIDELINES:
- Executive summary: concise but comprehensive, mention key decisions
- Detailed points: group by logical topics/themes, not chronologically
- Key takeaways: focus on decisions, insights, and important conclusions
- Action items: be specific, extract real tasks with owners when possible
- Priority: "high" for blockers/urgent, "medium" for normal tasks, "low" for nice-to-haves
- Use speaker names from the transcript, not generic labels where possible
- Capture nuance: disagreements, open questions, deferred decisions`,
      },
      {
        role: "user",
        content: `Here is the meeting transcript with speaker labels and timestamps:\n\n${formattedTranscript}`,
      },
    ],
  });

  const result = JSON.parse(response.choices[0].message.content || "{}");

  // Build the full MeetingSummary object
  const summary: MeetingSummary = {
    id: uuidv4(),
    title: result.title || "Meeting Summary",
    date: new Date().toISOString(),
    duration: formatDuration(transcript.durationSeconds),
    speakers: transcript.speakers,
    executiveSummary: result.executiveSummary || "",
    detailedPoints: (result.detailedPoints || []).map((dp: any) => ({
      topic: dp.topic,
      points: dp.points || [],
      speakers: dp.speakers || [],
    })),
    keyTakeaways: result.keyTakeaways || [],
    actionItems: (result.actionItems || []).map(
      (item: any): ActionItem => ({
        task: item.task,
        assignee: item.assignee || null,
        deadline: item.deadline || null,
        priority: item.priority || "medium",
      })
    ),
    transcript,
  };

  return summary;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes} minutes`;
}
