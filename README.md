# GreenPack Sustainability Tracker

## Setup
1. Install dependencies: `npm install`
2. Configure environment variables in `.env` (see `.env.example`)
3. Start development server: `npm run dev`

## Docker
Run locally with: `docker-compose up`

## Architecture
- **Frontend**: React + Tailwind + i18next
- **Backend**: Express + Mongoose
- **Logic**: Versioned ruleset in `src/shared/ruleset.ts`
- **PDF**: Server-side generation using Puppeteer
- **Validation**: Zod schemas shared between client and server

## Scaling
- Replace in-memory rate limiter with Redis.
- Use a task queue (e.g., BullMQ) for PDF generation if volume is high.
- Store PDFs in S3/GridFS for persistence.
