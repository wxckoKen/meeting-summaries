"use client";

import type { ProcessingStatus } from "@/types";

const STAGE_LABELS: Record<ProcessingStatus["stage"], string> = {
  uploading: "Uploading",
  transcribing: "Transcribing",
  diarizing: "Identifying Speakers",
  summarizing: "Generating Summary",
  complete: "Complete",
  error: "Error",
};

interface ProgressBarProps {
  status: ProcessingStatus;
}

export function ProgressBar({ status }: ProgressBarProps) {
  const isError = status.stage === "error";
  const isComplete = status.stage === "complete";

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">
          {STAGE_LABELS[status.stage]}
        </span>
        <span className="text-sm text-gray-500">{status.progress}%</span>
      </div>

      {/* Progress track */}
      <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            isError
              ? "bg-red-500"
              : isComplete
                ? "bg-green-500"
                : "bg-brand-500"
          }`}
          style={{ width: `${status.progress}%` }}
        />
      </div>

      <p className="mt-2 text-sm text-gray-500">{status.message}</p>

      {/* Animated dots while processing */}
      {!isComplete && !isError && (
        <div className="mt-3 flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-2 w-2 rounded-full bg-brand-400 animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
