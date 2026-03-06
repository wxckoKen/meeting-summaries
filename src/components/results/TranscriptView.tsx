"use client";

import type { Transcript } from "@/types";

// Assign consistent colors to speakers
const SPEAKER_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500" },
  { bg: "bg-purple-100", text: "text-purple-700", dot: "bg-purple-500" },
  { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  { bg: "bg-rose-100", text: "text-rose-700", dot: "bg-rose-500" },
  { bg: "bg-cyan-100", text: "text-cyan-700", dot: "bg-cyan-500" },
];

function getSpeakerColor(speaker: string, allSpeakers: string[]) {
  const index = allSpeakers.indexOf(speaker);
  return SPEAKER_COLORS[index % SPEAKER_COLORS.length];
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface TranscriptViewProps {
  transcript: Transcript;
}

export function TranscriptView({ transcript }: TranscriptViewProps) {
  return (
    <div className="p-6">
      <div className="mb-4 flex flex-wrap gap-2">
        {transcript.speakers.map((speaker) => {
          const color = getSpeakerColor(speaker, transcript.speakers);
          return (
            <span
              key={speaker}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${color.bg} ${color.text}`}
            >
              <span className={`h-2 w-2 rounded-full ${color.dot}`} />
              {speaker}
            </span>
          );
        })}
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {transcript.segments.map((segment, i) => {
          const color = getSpeakerColor(segment.speaker, transcript.speakers);
          return (
            <div key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-12 pt-1">
                <span className="text-xs text-gray-400 font-mono">
                  {formatTime(segment.startTime)}
                </span>
              </div>
              <div className="flex-1">
                <span
                  className={`inline-block rounded-md px-2 py-0.5 text-xs font-medium mb-1 ${color.bg} ${color.text}`}
                >
                  {segment.speaker}
                </span>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {segment.text}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
