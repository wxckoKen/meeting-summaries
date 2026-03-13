import { NextResponse } from "next/server";
import { getAllSummaries } from "@/lib/db";

export async function GET() {
  try {
    const summaries = getAllSummaries();
    return NextResponse.json(summaries);
  } catch (error: any) {
    console.error("[summaries] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch summaries" },
      { status: 500 }
    );
  }
}
