// ── Sports data service ────────────────────────────────────────────────────
// All external API calls go through /api/* Vercel serverless functions
// to avoid CORS issues when running in the browser.

export function fmtDate(d) {
  return d.toISOString().split('T')[0];
}

export function getDaysInView(view) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (view === 'today') return [today];
  if (view === 'weekend') {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dow = d.getDay();
      if (dow === 6 || dow === 0) days.push(d);
    }
    if (days.length === 0) {
      for (let i = 1; i <= 7; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        const dow = d.getDay();
        if (dow === 6 || dow === 0) days.push(d);
        if (days.length === 2) break;
      }
    }
    return days;
  }
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

// ── TheSportsDB (via /api/sportsdb proxy) ─────────────────────────────────

const LEAGUE_IDS = {
  epl: 4328, ucl: 4480, superRugbyPacific: 4509,
  urc: 4800, ipl: 5552, f1: 4370,
};

function formatTimeSAST(strTime) {
  if (!strTime) return 'TBC';
  try {
    const [h, m] = strTime.split(':').map(Number);
    const sast = (h + 2) % 24;
    return `${String(sast).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  } catch { return 'TBC'; }
}

function mapSport(strSport) {
  if (!strSport) return null;
  const s = strSport.toLowerCase();
  if (s.includes('soccer') || s.includes('football')) return 'football';
  if (s.includes('rugby')) return 'rugby';
  if (s.includes('cricket')) return 'cricket';
  if (s.includes('tennis')) return 'tennis';
  if (s.includes('golf')) return 'golf';
  if (s.includes('motor')) return 'f1';
  if (s.includes('athlet')) return 'athletics';
  return null;
}

function getHighlight(home, away, league) {
  const str = `${home} ${away} ${league}`.toLowerCase();
  if (str.includes('springbok') || str.includes('south africa') || str.includes('proteas')) {
    return { highlight: true, highlightLabel: '🟢 Springboks' };
  }
  if (str.includes('grey college') || str.includes('grey coll')) {
    return { highlight: true, highlightLabel: '⭐ Grey College' };
  }
  if (str.includes('bulls') || str.includes('lions') || str.includes('sharks') ||
      str.includes('stormers') || str.includes('cheetahs') || str.includes('griquas')) {
    return { highlight: true, highlightLabel: '🟢 SA Team' };
  }
  return { highlight: false, highlightLabel: null };
}

export async function fetchFromSportsDB(dateStr) {
  const results = [];
  const promises = Object.entries(LEAGUE_IDS).map(([, id]) =>
    fetch(`/api/sportsdb?date=${dateStr}&leagueId=${id}`)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null)
  );
  const responses = await Promise.allSettled(promises);
  responses.forEach(res => {
    if (res.status !== 'fulfilled' || !res.value?.events) return;
    res.value.events.forEach(ev => {
      const sport = mapSport(ev.strSport);
      if (!sport) return;
      const { highlight, highlightLabel } = getHighlight(ev.strHomeTeam, ev.strAwayTeam, ev.strLeague);
      results.push({
        id: `tsdb-${ev.idEvent}`,
        sport,
        home: ev.strHomeTeam,
        away: ev.strAwayTeam,
        competition: ev.strLeague,
        venue: ev.strVenue || '',
        time: formatTimeSAST(ev.strTime),
        date: ev.dateEvent,
        status: ev.strStatus === 'Match Finished' ? 'finished'
              : ev.strStatus === 'In Progress' ? 'live' : 'upcoming',
        result: ev.intHomeScore != null && ev.intAwayScore != null
          ? `${ev.strHomeTeam} ${ev.intHomeScore} – ${ev.intAwayScore} ${ev.strAwayTeam}`
          : null,
        highlight,
        highlightLabel,
        source: 'sportsdb',
      });
    });
  });
  return results;
}

// ── Claude AI (via /api/claude proxy) ─────────────────────────────────────

const CLAUDE_SYSTEM = `You are a sports fixtures assistant for a South African audience.
Return ONLY a valid JSON array. No markdown, no explanation, no code fences, no preamble.

Each fixture object must have exactly these fields:
{
  "sport": "football" | "rugby" | "cricket" | "tennis" | "golf" | "f1" | "athletics",
  "home": "Team or Player A",
  "away": "Team or Player B",
  "competition": "Full competition name",
  "venue": "Stadium or circuit name",
  "time": "HH:MM in SAST (UTC+2), or TBC",
  "status": "upcoming" | "live" | "finished",
  "result": null or "Home X – Y Away" if finished,
  "highlight": true if it involves a South African team/player or Grey College,
  "highlightLabel": "🟢 Springboks" | "🟢 SA Team" | "⭐ Grey College" | null,
  "notes": short string or null (e.g. "Day 3 of 5", "Semi-Final", "FP2")
}

INCLUSION RULES — only include these competitions:

FOOTBALL: Premier League, UEFA Champions League, FIFA World Cup only.
TENNIS: Grand Slams only (Australian Open, French Open/Roland Garros, Wimbledon, US Open).
CRICKET: All international cricket (Tests, ODIs, T20Is, ICC tournaments), SA domestic (CSA T20 Challenge, CSA One-Day Cup, Momentum One-Day Cup, 4-Day Domestic), all professional T20 leagues (SA20, IPL, The Hundred, BBL, CPL, PSL, ILT20, LPL, MLC).
RUGBY: Super Rugby (Pacific/Americas/Africa), URC, Champions Cup, European Challenge Cup, Currie Cup, Carling Xtreme Cup, Rugby Championship, Six Nations, British & Irish Lions, Autumn Internationals, Rugby World Cup, major SA schoolboy rugby, Craven Week. Flag Grey College and all Springbok fixtures prominently.
GOLF: The four Majors, PGA Tour, DP World Tour.
F1: ALL sessions — FP1, FP2, FP3, Qualifying, Sprint Qualifying, Sprint Race, Race.
ATHLETICS: Diamond League, World Athletics Championships, Olympic athletics.

Return [] if nothing matches on the requested date.`;

export async function fetchFromClaude(apiKey, dateStr) {
  const date = new Date(dateStr + 'T12:00:00Z');
  const dayName = date.toLocaleDateString('en-ZA', { weekday: 'long', timeZone: 'Africa/Johannesburg' });
  const fullDate = date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Africa/Johannesburg' });

  const userPrompt = `Use web search to find all sports fixtures on ${dayName} ${fullDate}.
Apply the inclusion rules exactly. Return ALL matching fixtures as a JSON array in SAST times.
Search for rugby, cricket, football, tennis, golf, F1, and athletics.`;

  const response = await fetch('/api/claude', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      apiKey,
      body: {
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: CLAUDE_SYSTEM,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        messages: [{ role: 'user', content: userPrompt }],
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  const fullText = data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  const clean = fullText.replace(/```json|```/gi, '').trim();
  const start = clean.indexOf('[');
  const end = clean.lastIndexOf(']');
  if (start === -1 || end === -1) return [];

  const fixtures = JSON.parse(clean.substring(start, end + 1));
  return fixtures.map((f, i) => ({
    ...f,
    id: `claude-${dateStr}-${i}`,
    date: dateStr,
    source: 'claude',
  }));
}

// ── Main orchestrator ─────────────────────────────────────────────────────

function dedupe(sportsDb, claude) {
  const merged = [...sportsDb];
  claude.forEach(cf => {
    const dup = merged.some(sf => {
      const h = (sf.home || '').toLowerCase();
      const a = (sf.away || '').toLowerCase();
      const ch = (cf.home || '').toLowerCase();
      const ca = (cf.away || '').toLowerCase();
      return h.includes(ch.split(' ')[0]) && a.includes(ca.split(' ')[0]);
    });
    if (!dup) merged.push(cf);
  });
  return merged;
}

function sortFixtures(fixtures) {
  return fixtures.sort((a, b) => {
    const ta = (!a.time || a.time === 'TBC') ? '99:99' : a.time;
    const tb = (!b.time || b.time === 'TBC') ? '99:99' : b.time;
    return ta.localeCompare(tb);
  });
}

export async function fetchFixturesForDate(dateStr, apiKey) {
  const [sportsDbResult, claudeResult] = await Promise.allSettled([
    fetchFromSportsDB(dateStr),
    apiKey ? fetchFromClaude(apiKey, dateStr) : Promise.resolve([]),
  ]);

  const sdb = sportsDbResult.status === 'fulfilled' ? sportsDbResult.value : [];
  const cl  = claudeResult.status === 'fulfilled'  ? claudeResult.value  : [];

  if (claudeResult.status === 'rejected') {
    throw claudeResult.reason;
  }

  return sortFixtures(dedupe(sdb, cl));
}
