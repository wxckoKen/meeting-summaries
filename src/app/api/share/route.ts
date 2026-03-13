import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { formatAsHtml } from "@/lib/format-summary";
import type { MeetingSummary } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const { emails, summary } = (await request.json()) as {
      emails: string[];
      summary: MeetingSummary;
    };

    if (!emails || emails.length === 0) {
      return NextResponse.json(
        { error: "At least one email address is required" },
        { status: 400 }
      );
    }

    if (!summary) {
      return NextResponse.json(
        { error: "Summary data is required" },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);
    const fromEmail = process.env.RESEND_FROM_EMAIL || "meetings@resend.dev";

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: emails,
      subject: `Meeting Summary: ${summary.title}`,
      html: formatAsHtml(summary),
    });

    if (error) {
      console.error("[share] Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[share] Error:", error);
    return NextResponse.json(
      { error: "Failed to share: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
