import { NextRequest, NextResponse } from "next/server";
import { getJob } from "@/lib/process-meeting";

/**
 * GET /api/status?id=<jobId>
 *
 * Poll this endpoint to check the progress of a processing job.
 * Returns the current stage, progress percentage, and (when complete)
 * the full meeting summary.
 */
export async function GET(request: NextRequest) {
  const jobId = request.nextUrl.searchParams.get("id");

  if (!jobId) {
    return NextResponse.json(
      { error: "Missing required query parameter: id" },
      { status: 400 }
    );
  }

  const job = getJob(jobId);

  if (!job) {
    return NextResponse.json(
      { error: `No job found with id: ${jobId}` },
      { status: 404 }
    );
  }

  return NextResponse.json(job);
}
