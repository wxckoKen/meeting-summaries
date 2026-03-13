import Database from "better-sqlite3";
import path from "path";
import type { MeetingSummary } from "@/types";

/** Summary row stored in SQLite (JSON blob for full data) */
interface SummaryRow {
  id: string;
  title: string;
  date: string;
  duration: string;
  speaker_count: number;
  speakers: string;
  json_data: string;
}

function getDbPath(): string {
  // Use /tmp in production (Railway ephemeral filesystem), cwd in dev
  const dir =
    process.env.NODE_ENV === "production" ? "/tmp" : process.cwd();
  return path.join(dir, "meeting-summarizer.db");
}

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(getDbPath());
    db.pragma("journal_mode = WAL");
    db.exec(`
      CREATE TABLE IF NOT EXISTS summaries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        date TEXT NOT NULL,
        duration TEXT NOT NULL,
        speaker_count INTEGER NOT NULL,
        speakers TEXT NOT NULL,
        json_data TEXT NOT NULL
      )
    `);
  }
  return db;
}

export function saveSummary(summary: MeetingSummary): void {
  const stmt = getDb().prepare(`
    INSERT OR REPLACE INTO summaries (id, title, date, duration, speaker_count, speakers, json_data)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    summary.id,
    summary.title,
    summary.date,
    summary.duration,
    summary.speakers.length,
    summary.speakers.join(", "),
    JSON.stringify(summary)
  );
}

export function getAllSummaries(): Omit<SummaryRow, "json_data">[] {
  return getDb()
    .prepare(
      "SELECT id, title, date, duration, speaker_count, speakers FROM summaries ORDER BY date DESC"
    )
    .all() as Omit<SummaryRow, "json_data">[];
}

export function getSummaryById(id: string): MeetingSummary | null {
  const row = getDb()
    .prepare("SELECT json_data FROM summaries WHERE id = ?")
    .get(id) as { json_data: string } | undefined;
  return row ? JSON.parse(row.json_data) : null;
}

export function deleteSummary(id: string): boolean {
  const result = getDb()
    .prepare("DELETE FROM summaries WHERE id = ?")
    .run(id);
  return result.changes > 0;
}
