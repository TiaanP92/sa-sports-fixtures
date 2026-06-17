# SA Sports Fixtures

Your personal sports fixture tracker, tailored for South Africa.
**100% free to run** — no Anthropic API, no paid services.

---

## Data Sources (all free)

| Sport | Source | Free Tier |
|-------|--------|-----------|
| 🏉 Rugby | Highlightly | 100 requests/day |
| 🏏 Cricket | Highlightly | 100 requests/day |
| ⚽ Football | Highlightly | 100 requests/day |
| 🎾 Tennis (Grand Slams) | TheSportsDB | Unlimited, no key |
| 🏎️ F1 | TheSportsDB | Unlimited, no key |

---

## 🔑 Step 1 — Get your free Highlightly API key

1. Go to [highlightly.net/login](https://highlightly.net/login)
2. Sign up (free, no credit card)
3. Go to your **Dashboard** → find your **API Key**
4. Copy it — you'll need it in Step 3

This one key works across Rugby, Cricket, and Football (100 requests/day each, separately tracked).

---

## 🚀 Step 2 — Deploy to Vercel

### Upload to GitHub
1. Go to [github.com](https://github.com) → sign up/log in
2. **New repository** → name it `sa-sports-fixtures` → Create
3. **uploading an existing file** → drag in all files from this folder → Commit

### Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → sign up with GitHub
2. **Add New Project** → select `sa-sports-fixtures`
3. Leave settings as default → **Deploy**

---

## ⚙️ Step 3 — Add your API key to Vercel

This is the important part — the key lives server-side, never in the browser:

1. In your Vercel project → **Settings** → **Environment Variables**
2. Add a new variable:
   - **Name:** `HIGHLIGHTLY_API_KEY`
   - **Value:** *(paste your Highlightly key here)*
3. Click **Save**
4. Go to **Deployments** → click "..." on the latest one → **Redeploy**

That's it — no API keys needed inside the app itself. Everyone who visits your URL gets fixtures automatically.

---

## Features

- **Today / Weekend / This Week** views
- **Sport filter pills**
- **🟢 Springbok fixtures** highlighted in green
- **⭐ Grey College** fixtures flagged in gold
- **SA team** fixtures (Bulls, Lions, Sharks, Stormers, Cheetahs, Pumas, etc.) highlighted
- Expandable fixture cards with venue, competition, and result
- All times in **SAST (UTC+2)**

---

## Known Limitations (free tier tradeoffs)

- **Rugby/Cricket/Football:** Limited to 100 requests/day each on Highlightly's free plan. Each "Refresh" in the app uses a few requests, so heavy refreshing could hit the daily cap (resets every 24h).
- **Tennis:** Only Grand Slams (Australian Open, French Open, Wimbledon, US Open) — TheSportsDB doesn't reliably separate Slams from other ATP/WTA events, so some manual league-name filtering is applied.
- **Golf & Athletics:** Not included — no reliable free API exists for PGA Tour/Majors or Diamond League fixtures. Could be added later via a paid API if needed.
- **SA Schoolboy Rugby / Grey College / Craven Week:** Highlightly's rugby coverage focuses on professional competitions. Schoolboy fixtures are unlikely to appear — this is the tradeoff for staying fully free.
