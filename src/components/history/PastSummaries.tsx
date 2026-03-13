"use client";

import { useState, useEffect, useCallback } from "react";
import type { MeetingSummary } from "@/types";
import { SummaryView } from "@/components/results/SummaryView";

interface SummaryListItem {
  id: string;
  title: string;
  date: string;
  duration: string;
  speaker_count: number;
  speakers: string;
}

interface PastSummariesProps {
  onBack: () => void;
}

export function PastSummaries({ onBack }: PastSummariesProps) {
  const [summaries, setSummaries] = useState<SummaryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<MeetingSummary | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const fetchSummaries = useCallback(async () => {
    try {
      const res = await fetch("/api/summaries");
      if (res.ok) setSummaries(await res.json());
    } catch (err) {
      console.error("Failed to fetch summaries:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummaries();
  }, [fetchSummaries]);

  const handleSelect = async (id: string) => {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/summaries/${id}`);
      if (res.ok) setSelected(await res.json());
    } catch (err) {
      console.error("Failed to load summary:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm("Delete this summary?")) return;
    try {
      const res = await fetch(`/api/summaries/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSummaries((prev) => prev.filter((s) => s.id !== id));
        if (selected?.id === id) setSelected(null);
      }
    } catch (err) {
      console.error("Failed to delete summary:", err);
    }
  };

  if (selected) {
    return (
      <SummaryView
        summary={selected}
        onReset={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Past Summaries</h2>
        <button
          onClick={onBack}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          New Recording
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-400">Loading...</div>
      ) : summaries.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center">
          <p className="text-gray-400">No past summaries yet.</p>
          <button
            onClick={onBack}
            className="mt-4 text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            Record your first meeting
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {summaries.map((s) => (
            <button
              key={s.id}
              onClick={() => handleSelect(s.id)}
              disabled={loadingId === s.id}
              className="w-full text-left rounded-xl border border-gray-100 bg-white p-5 shadow-sm hover:border-brand-200 hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {loadingId === s.id ? "Loading..." : s.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(s.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    &middot; {s.duration} &middot; {s.speaker_count} speaker
                    {s.speaker_count !== 1 ? "s" : ""}
                  </p>
                  {s.speakers && (
                    <p className="mt-1 text-xs text-gray-400 truncate">
                      {s.speakers}
                    </p>
                  )}
                </div>
                <div
                  onClick={(e) => handleDelete(e, s.id)}
                  className="ml-4 p-2 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                  role="button"
                  aria-label="Delete summary"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
