"use client";

import { useState } from "react";
import { useProcessing } from "@/hooks/useProcessing";
import { UploadZone } from "@/components/upload/UploadZone";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SummaryView } from "@/components/results/SummaryView";
import { PastSummaries } from "@/components/history/PastSummaries";

type View = "new" | "history";

export default function Home() {
  const { upload, status, summary, error, isUploading, reset } =
    useProcessing();
  const [view, setView] = useState<View>("new");

  const isProcessing = status && status.stage !== "complete" && status.stage !== "error";

  // If we have a summary result, show it
  if (summary) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <SummaryView summary={summary} onReset={reset} />
        <footer className="mt-16 text-center text-xs text-gray-400">
          Powered by OpenAI Whisper &amp; GPT-4o
        </footer>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      {!isProcessing && (
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Meeting Summarizer
          </h1>
          <p className="mt-3 text-lg text-gray-500">
            Upload a recording. Get speaker-labeled transcripts, key takeaways,
            and action items — powered by AI.
          </p>
        </div>
      )}

      {/* View toggle — only when idle */}
      {!isProcessing && !error && (
        <div className="mb-8 flex justify-center">
          <div className="inline-flex gap-1 rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setView("new")}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-all ${
                view === "new"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              New Recording
            </button>
            <button
              onClick={() => setView("history")}
              className={`rounded-md px-5 py-2 text-sm font-medium transition-all ${
                view === "history"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Past Summaries
            </button>
          </div>
        </div>
      )}

      {/* New recording view */}
      {view === "new" && !isProcessing && (
        <UploadZone onFile={upload} disabled={isUploading} />
      )}

      {/* Past summaries view */}
      {view === "history" && !isProcessing && (
        <PastSummaries onBack={() => setView("new")} />
      )}

      {/* Error message */}
      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4">
          <div className="flex items-start gap-3">
            <svg className="h-5 w-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Something went wrong</p>
              <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
          </div>
          <button
            onClick={reset}
            className="mt-3 text-sm font-medium text-red-700 underline hover:text-red-800"
          >
            Try again
          </button>
        </div>
      )}

      {/* Processing progress */}
      {isProcessing && status && (
        <div className="mt-8">
          <ProgressBar status={status} />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 text-center text-xs text-gray-400">
        Powered by OpenAI Whisper &amp; GPT-4o
      </footer>
    </main>
  );
}
