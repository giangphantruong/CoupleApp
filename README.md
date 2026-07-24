# Us — a shared photo & video timeline for couples

A private, install-like-an-app website for two people to share daily photos/videos
and view them as a time-sorted timeline that can be exported as a PNG.

## What's here so far (Phase 0)

- Sign up / log in (`app/signup`, `app/login`)
- Pairing flow: each account gets a short code; entering your partner's code links
  the two accounts into one "couple" (`app/pair`)
- A placeholder feed page confirming the above works end-to-end (`app/feed`)
- Database schema + row-level security policies (`supabase/schema.sql`)
- Installable as a home-screen app (`public/manifest.json`)

Not built yet: photo/video capture and upload, the shared feed, the timeline
table view, and PNG export. These come next.

## Running it locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

You'll need a Supabase project connected before signup/login actually work —
copy `.env.example` to `.env.local` and fill in your project's URL and anon key,
then run `supabase/schema.sql` in that project's SQL Editor.
