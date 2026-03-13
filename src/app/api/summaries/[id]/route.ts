import { NextRequest, NextResponse } from "next/server";
import { getSummaryById, deleteSummary } from "@/lib/db";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const summary = getSummaryById(params.id);
    if (!summary) {
      return NextResponse.json(
        { error: "Summary not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(summary);
  } catch (error: any) {
    console.error("[summaries/id] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = deleteSummary(params.id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Summary not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[summaries/id] Delete error:", error);
    return NextResponse.json(
      { error: "Failed to delete summary" },
      { status: 500 }
    );
  }
}
