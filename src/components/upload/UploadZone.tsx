"use client";

import { useState, useRef, useCallback } from "react";
import { MAX_FILE_SIZE_MB } from "@/types";

interface UploadZoneProps {
  onFile: (file: File) => void;
  disabled?: boolean;
}

/**
 * Drag-and-drop audio upload zone with file picker fallback.
 */
export function UploadZone({ onFile, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile, disabled]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) onFile(file);
    },
    [onFile]
  );

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`
        relative cursor-pointer rounded-2xl border-2 border-dashed p-12
        text-center transition-all duration-200
        ${isDragging
          ? "border-brand-500 bg-brand-50 scale-[1.02]"
          : "border-gray-300 bg-white hover:border-brand-400 hover:bg-gray-50"
        }
        ${disabled ? "pointer-events-none opacity-50" : ""}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".mp3,.wav,.m4a,.ogg,.webm,audio/*"
        onChange={handleChange}
        className="hidden"
      />

      {/* Microphone icon */}
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
        <svg
          className="h-8 w-8 text-brand-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-gray-900">
        Drop your meeting recording here
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        or click to browse — MP3, WAV, M4A up to {MAX_FILE_SIZE_MB}MB
      </p>
    </div>
  );
}
