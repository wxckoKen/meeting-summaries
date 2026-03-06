"use client";

import { useState, useCallback, useRef } from "react";
import type { ProcessingStatus, MeetingSummary } from "@/types";

/**
 * Custom hook that handles the full upload → poll → result lifecycle.
 *
 * Usage:
 *   const { upload, status, summary, error, reset } = useProcessing();
 *   <UploadZone onFile={upload} />
 *   {status && <ProgressBar status={status} />}
 *   {summary && <SummaryView summary={summary} />}
 */
export function useProcessing() {
  const [status, setStatus] = useState<ProcessingStatus | null>(null);
  const [summary, setSummary] = useState<MeetingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollForStatus = useCallback(
    (jobId: string) => {
      pollRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/status?id=${jobId}`);
          if (!res.ok) throw new Error("Failed to check status");

          const data: ProcessingStatus = await res.json();
          setStatus(data);

          if (data.stage === "complete" && data.result) {
            stopPolling();
            setSummary(data.result);
          } else if (data.stage === "error") {
            stopPolling();
            setError(data.error || "Processing failed");
          }
        } catch (err: any) {
          stopPolling();
          setError(err.message);
        }
      }, 1500); // Poll every 1.5 seconds
    },
    [stopPolling]
  );

  const upload = useCallback(
    async (file: File) => {
      setError(null);
      setSummary(null);
      setIsUploading(true);
      setStatus({
        id: "",
        stage: "uploading",
        progress: 0,
        message: "Uploading file...",
      });

      try {
        const formData = new FormData();
        formData.append("audio", file);

        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }

        const { jobId } = await res.json();
        setIsUploading(false);
        pollForStatus(jobId);
      } catch (err: any) {
        setIsUploading(false);
        setError(err.message);
        setStatus(null);
      }
    },
    [pollForStatus]
  );

  const reset = useCallback(() => {
    stopPolling();
    setStatus(null);
    setSummary(null);
    setError(null);
    setIsUploading(false);
  }, [stopPolling]);

  return { upload, status, summary, error, isUploading, reset };
}
