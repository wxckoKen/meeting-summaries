import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";
import { processMeeting, setJob } from "@/lib/process-meeting";
import { MAX_FILE_SIZE_BYTES, ACCEPTED_AUDIO_TYPES } from "@/types";

/**
 * POST /api/upload
 *
 * Accepts an audio file upload, validates it, saves to disk,
 * and kicks off the async processing pipeline.
 *
 * Returns a job ID that the client uses to poll for progress.
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("audio") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No audio file provided. Send a file with key 'audio'." },
        { status: 400 }
      );
    }

    // Validate file type
    if (
      !ACCEPTED_AUDIO_TYPES.includes(file.type as any) &&
      !file.name.match(/\.(mp3|wav|m4a|ogg|webm)$/i)
    ) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Accepted: MP3, WAV, M4A, OGG, WebM.`,
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum: 50MB.`,
        },
        { status: 400 }
      );
    }

    // Save file to temp directory
    const uploadsDir = join(process.cwd(), "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const ext = file.name.split(".").pop() || "mp3";
    const fileName = `${uuidv4()}.${ext}`;
    const filePath = join(uploadsDir, fileName);

    const bytes = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(bytes));

    // Create a processing job and start the pipeline
    const jobId = uuidv4();
    setJob(jobId, {
      id: jobId,
      stage: "uploading",
      progress: 5,
      message: "File uploaded, starting processing...",
    });

    // Fire-and-forget: process runs in background
    processMeeting(jobId, filePath).catch(console.error);

    return NextResponse.json({ jobId, message: "Processing started" });
  } catch (error: any) {
    console.error("[upload] Error:", error);
    return NextResponse.json(
      { error: "Upload failed: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}

// Use App Router route segment config for body size limit
export const maxDuration = 60;
