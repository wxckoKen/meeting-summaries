"use client";

import { useState } from "react";
import type { ActionItem } from "@/types";

const PRIORITY_STYLES = {
  high: {
    badge: "bg-red-100 text-red-700",
    dot: "bg-red-500",
    label: "High",
  },
  medium: {
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
    label: "Medium",
  },
  low: {
    badge: "bg-gray-100 text-gray-600",
    dot: "bg-gray-400",
    label: "Low",
  },
};

interface ActionItemListProps {
  items: ActionItem[];
}

export function ActionItemList({ items }: ActionItemListProps) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  if (items.length === 0) {
    return (
      <div className="p-12 text-center text-gray-400">
        No action items identified in this meeting.
      </div>
    );
  }

  // Sort: high first, then medium, then low
  const sorted = [...items].sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });

  return (
    <div className="divide-y divide-gray-50">
      {sorted.map((item, i) => {
        const style = PRIORITY_STYLES[item.priority];
        const isDone = checked.has(i);

        return (
          <div
            key={i}
            className={`flex items-start gap-4 p-4 transition-colors ${
              isDone ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"
            }`}
          >
            {/* Checkbox */}
            <button
              onClick={() => toggle(i)}
              className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition-colors ${
                isDone
                  ? "border-brand-500 bg-brand-500"
                  : "border-gray-300 hover:border-brand-400"
              }`}
            >
              {isDone && (
                <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
                {item.task}
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${style.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                  {style.label}
                </span>
                {item.assignee && (
                  <span className="text-xs text-gray-500">
                    Assigned to {item.assignee}
                  </span>
                )}
                {item.deadline && (
                  <span className="text-xs text-gray-400">
                    Due: {item.deadline}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}

      {/* Completion count */}
      <div className="p-4 text-center text-xs text-gray-400">
        {checked.size} of {items.length} completed
      </div>
    </div>
  );
}
