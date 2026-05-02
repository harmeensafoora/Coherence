# Coherence

**Version control for your thinking.**

Most decisions don't happen in a moment — they evolve over weeks, conversations, and changing circumstances. Coherence lets you track *how* your reasoning changes over time, so you can catch drift before it costs you.

## What it does

- **Commit your reasoning** — log snapshots of your thinking on any decision or question
- **Set anchors** — define the principles you don't want to compromise
- **Detect drift** — AI flags when your recent commits contradict your anchors or earlier reasoning
- **Review your thread** — see your full reasoning history in one place

## Tech stack

- React + TypeScript
- Supabase (auth + database)
- Gemini 2.5 Flash
- Vite
- Vercel

## Try it

🔗 [mycoherence.vercel.app](https://mycoherence.vercel.app)

## Run locally

### Prerequisites
- Node.js
- A Supabase project
- A Gemini API key (get one at [aistudio.google.com](https://aistudio.google.com/apikey))

### Setup

1. Clone the repo
```bash
   git clone https://github.com/harmeensafoora/Coherence.git
   cd Coherence
```

2. Install dependencies
```bash
   npm install
```

3. Create a `.env.local` file based on `.env.example` and fill in your keys

4. Run the app
```bash
   npm run dev
```

## Built by

[Harmeen Safoora](https://github.com/harmeensafoora)
