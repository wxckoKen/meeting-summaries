"use client";

import { useState } from "react";
import type { MeetingSummary } from "@/types";
import { TranscriptView } from "./TranscriptView";
import { ActionItemList } from "./ActionItemList";
import { ShareModal } from "./ShareModal";

interface SummaryViewProps {
  summary: MeetingSummary;
  onReset: () => void;
}

type Tab = "summary" | "transcript" | "actions";

/**
 * Main results view — tabbed interface showing summary, transcript, and action items.
 */
export function SummaryView({ summary, onReset }: SummaryViewProps) {
  const [activeTab, setActiveTab] = useState<Tab>("summary");
  const [showShare, setShowShare] = useState(false);

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "summary", label: "Summary" },
    { key: "actions", label: "Action Items", count: summary.actionItems.length },
    { key: "transcript", label: "Transcript" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{summary.title}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {summary.duration} &middot; {summary.speakers.length} speaker
            {summary.speakers.length !== 1 ? "s" : ""} &middot;{" "}
            {summary.speakers.join(", ")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowShare(true)}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 transition-colors flex items-center gap-2"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
            </svg>
            Share
          </button>
          <button
            onClick={onReset}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            New Recording
          </button>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === tab.key
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span className="ml-1.5 inline-flex items-center rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl bg-white border border-gray-100 shadow-sm">
        {activeTab === "summary" && <SummaryTab summary={summary} />}
        {activeTab === "transcript" && (
          <TranscriptView transcript={summary.transcript} />
        )}
        {activeTab === "actions" && (
          <ActionItemList items={summary.actionItems} />
        )}
      </div>

      {/* Share modal */}
      {showShare && (
        <ShareModal summary={summary} onClose={() => setShowShare(false)} />
      )}
    </div>
  );
}

/** Summary tab content — executive summary, detailed points, key takeaways */
function SummaryTab({ summary }: { summary: MeetingSummary }) {
  return (
    <div className="divide-y divide-gray-100">
      {/* Executive summary */}
      <div className="p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
          Overview
        </h3>
        <p className="text-gray-700 leading-relaxed">
          {summary.executiveSummary}
        </p>
      </div>

      {/* Key takeaways */}
      {summary.keyTakeaways.length > 0 && (
        <div className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
            Key Takeaways
          </h3>
          <ul className="space-y-2">
            {summary.keyTakeaways.map((takeaway, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-brand-500" />
                <span className="text-gray-700">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Detailed discussion points */}
      {summary.detailedPoints.length > 0 && (
        <div className="p-6">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-4">
            Discussion Points
          </h3>
          <div className="space-y-5">
            {summary.detailedPoints.map((section, i) => (
              <div key={i}>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {section.topic}
                </h4>
                {section.speakers.length > 0 && (
                  <p className="text-xs text-gray-400 mb-2">
                    Contributors: {section.speakers.join(", ")}
                  </p>
                )}
                <ul className="space-y-1.5 ml-4">
                  {section.points.map((point, j) => (
                    <li
                      key={j}
                      className="text-sm text-gray-600 before:content-['–'] before:mr-2 before:text-gray-300"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
