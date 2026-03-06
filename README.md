# Meeting Summarizer

AI-powered meeting summarizer that turns audio recordings into structured, actionable meeting notes — with speaker identification, key takeaways, and to-do items.

## What it does

Upload a meeting recording and get:

- **Speaker diarization** — identifies who said what, using GPT-4o analysis of conversational patterns
- **Executive summary** — 2-3 sentence high-level overview
- **Detailed discussion points** — grouped by topic, with speaker attribution
- **Key takeaways** — decisions, insights, and important conclusions
- **Action items** — tasks with assignees, deadlines, and priority levels
- **Full transcript** — timestamped, color-coded by speaker

## Tech stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Transcription | OpenAI Whisper |
| Summarization | OpenAI GPT-4o |
| Testing | Jest + React Testing Library |
| CI/CD | GitHub Actions |
| Deployment | Docker (multi-stage build) |

## Quick start

```bash
# 1. Clone and install
git clone <your-repo-url> meeting-summarizer
cd meeting-summarizer
npm install

# 2. Configure your OpenAI key
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and upload a meeting recording.

## Project structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── upload/         # POST — accepts audio, starts processing
│   │   └── status/         # GET — poll for processing progress
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page (upload + results)
│   └── globals.css         # Tailwind + custom styles
├── components/
│   ├── ui/                 # Shared UI (ProgressBar)
│   ├── upload/             # UploadZone (drag & drop)
│   └── results/            # SummaryView, TranscriptView, ActionItemList
├── hooks/
│   └── useProcessing.ts    # Upload → poll → result lifecycle
├── lib/
│   ├── openai.ts           # OpenAI client singleton
│   ├── transcribe.ts       # Whisper transcription
│   ├── diarize.ts          # GPT-4o speaker diarization
│   ├── summarize.ts        # GPT-4o structured summarization
│   └── process-meeting.ts  # Orchestrates the full pipeline
└── types/
    └── index.ts            # TypeScript types for the domain
```

## How the pipeline works

1. **Upload** — Audio file saved to `uploads/`, job ID returned immediately
2. **Transcribe** — Whisper API produces timestamped segments
3. **Diarize** — GPT-4o analyzes the transcript to assign speaker labels based on conversational patterns, names, and context
4. **Summarize** — GPT-4o generates structured JSON: executive summary, discussion points, takeaways, and action items
5. **Poll** — Frontend polls `/api/status` every 1.5s for progress updates

## Scripts

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run format       # Run Prettier
npm run test         # Run Jest tests
npm run type-check   # TypeScript type checking
```

## Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t meeting-summarizer .
docker run -p 3000:3000 -e OPENAI_API_KEY=sk-... meeting-summarizer
```

## Configuration

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Yes | — | Your OpenAI API key |
| `OPENAI_MODEL` | No | `gpt-4o` | Model for summarization |
| `WHISPER_MODEL` | No | `whisper-1` | Model for transcription |
| `MAX_UPLOAD_SIZE_MB` | No | `50` | Max upload size |

## Upgrading speaker diarization

The built-in diarization uses GPT-4o to infer speakers from context. This works well for typical meetings where speakers take turns. For production use with overlapping speech or large group calls, consider swapping in a dedicated service:

- **AssemblyAI** — built-in diarization API, drop-in replacement
- **pyannote.audio** — open-source, run locally for privacy
- **Deepgram** — real-time diarization with streaming support

The `diarize.ts` module is isolated and easy to replace.

## License

MIT
