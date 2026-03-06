# Deployment Guide: GitHub + Railway

## Step 1: Push to GitHub

Open a terminal in the `meeting-summarizer` folder and run:

```bash
cd meeting-summarizer
git init
git add -A
git commit -m "Initial commit: AI meeting summarizer with speaker diarization"
git branch -M main

# Create a new GitHub repo (requires gh CLI: https://cli.github.com)
gh repo create meeting-summarizer --public --source=. --push

# Or manually: create a repo on github.com, then:
# git remote add origin https://github.com/YOUR_USERNAME/meeting-summarizer.git
# git push -u origin main
```

## Step 2: Deploy on Railway

### Option A: One-click deploy from GitHub (Recommended)

1. Go to [railway.app](https://railway.app) and sign in with GitHub
2. Click **"New Project"** → **"Deploy from GitHub Repo"**
3. Select your `meeting-summarizer` repository
4. Railway auto-detects the `railway.toml` config and builds with Nixpacks

### Option B: Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

## Step 3: Set Environment Variables

In your Railway project dashboard:

1. Go to your service → **Variables** tab
2. Add the following:

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | `sk-your-key-here` |
| `OPENAI_MODEL` | `gpt-4o` (optional) |
| `PORT` | `3000` |

Railway automatically injects `PORT` but explicitly setting it ensures consistency.

## Step 4: Configure Domain

1. In Railway, go to your service → **Settings** → **Networking**
2. Click **"Generate Domain"** to get a `*.up.railway.app` URL
3. Or add a custom domain if you have one

## That's it!

Your app will be live at `https://your-app.up.railway.app` within a few minutes.

### Estimated Railway costs
- **Hobby plan**: $5/month includes enough for moderate usage
- The app only uses compute during active requests (transcription + summarization)
- Typical meeting processing costs ~$0.02-0.10 in OpenAI API usage per recording
