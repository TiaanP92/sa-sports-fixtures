// ── Sports data service ────────────────────────────────────────────────────
// 100% free APIs, no paid dependency:
//   - Highlightly (free tier, 100 req/day per sport) for Rugby, Cricket, Football
//   - TheSportsDB (free, no key) for Tennis (Grand Slams) and F1
// All calls go through /api/* Vercel serverless proxies to avoid CORS issues.

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

// ── Highlight detection (SA-specific) ─────────────────────────────────────

function getHighlight(home, away, league) {
  const str = `${home} ${away} ${league}`.toLowerCase();
  if (str.includes('springbok') || str.includes('south africa') || str.includes('proteas')) {
    return { highlight: true, highlightLabel: '🟢 Springboks' };
  }
  if (str.includes('grey college') || str.includes('grey coll')) {
    return { highlight: true, highlightLabel: '⭐ Grey College' };
  }
  if (str.includes('bulls') || str.includes('lions') || str.includes('sharks') ||
      str.includes('stormers') || str.includes('cheetahs') || str.includes('griquas') ||
      str.includes('pumas') || str.includes('boland') || str.includes('griffons')) {
    return { highlight: true, highlightLabel: '🟢 SA Team' };
  }
  return { highlight: false, highlightLabel: null };
}

function formatTimeSAST(isoString) {
  if (!isoString) return 'TBC';
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-ZA', {
      hour: '2-digit', minute: '2-digit',
      hour12: false, timeZone: 'Africa/Johannesburg',
    });
  } catch { return 'TBC'; }
}

// ── Highlightly: Rugby ─────────────────────────────────────────────────────

const RUGBY_LEAGUES = [
  'Super Rugby', 'United Rugby Championship', 'Currie Cup',
  'Rugby Championship', 'Six Nations', 'Champions Cup', 'Challenge Cup',
  'World Cup', 'Lions Tour', 'Autumn Nations',
];

export async function fetchRugby(dateStr) {
  try {
    const res = await fetch(`/api/highlightly?sport=rugby&date=${dateStr}`);
    if (!res.ok) return [];
    const data = await res.json();
    const matches = data?.data || [];
    return matches
      .filter(m => RUGBY_LEAGUES.some(l => (m.league?.name || '').toLowerCase().includes(l.toLowerCase())))
      .map(m => {
        const { highlight, highlightLabel } = getHighlight(m.homeTeam?.name, m.awayTeam?.name, m.league?.name);
        return {
          id: `rugby-${m.id}`,
          sport: 'rugby',
          home: m.homeTeam?.name,
          away: m.awayTeam?.name,
          competition: m.league?.name,
          venue: m.venue?.name || '',
          time: formatTimeSAST(m.date),
          date: dateStr,
          status: mapStatus(m.state?.description),
          result: m.state?.score?.current ? `${m.homeTeam?.name} ${m.state.score.current} ${m.awayTeam?.name}` : null,
          highlight, highlightLabel,
          source: 'highlightly',
        };
      });
  } catch { return []; }
}

// ── Highlightly: Cricket ────────────────────────────────────────────────────

export async function fetchCricket(dateStr) {
  try {
    const res = await fetch(`/api/highlightly?sport=cricket&date=${dateStr}`);
    if (!res.ok) return [];
    const data = await res.json();
    const matches = data?.data || [];
    return matches.map(m => {
      const { highlight, highlightLabel } = getHighlight(m.homeTeam?.name, m.awayTeam?.name, m.league?.name);
      const scoreStr = m.state?.teams
        ? `${m.homeTeam?.name} ${m.state.teams.home?.score || ''} / ${m.awayTeam?.name} ${m.state.teams.away?.score || ''}`
        : null;
      return {
        id: `cricket-${m.id}`,
        sport: 'cricket',
        home: m.homeTeam?.name,
        away: m.awayTeam?.name,
        competition: m.league?.name,
        venue: m.venue?.name || '',
        time: formatTimeSAST(m.startTime),
        date: dateStr,
        status: mapStatus(m.state?.description),
        result: m.state?.description === 'Finished' ? (m.state?.report || scoreStr) : null,
        notes: m.format ? `${m.format}${m.state?.description ? ' · ' + m.state.description : ''}` : null,
        highlight, highlightLabel,
        source: 'highlightly',
      };
    });
  } catch { return []; }
}

// ── Highlightly: Football ───────────────────────────────────────────────────

const FOOTBALL_LEAGUES = ['Premier League', 'Champions League', 'World Cup'];

export async function fetchFootball(dateStr) {
  try {
    const res = await fetch(`/api/highlightly?sport=football&date=${dateStr}`);
    if (!res.ok) return [];
    const data = await res.json();
    const matches = data?.data || [];
    return matches
      .filter(m => FOOTBALL_LEAGUES.some(l => (m.league?.name || '').toLowerCase().includes(l.toLowerCase())))
      .map(m => {
        const { highlight, highlightLabel } = getHighlight(m.homeTeam?.name, m.awayTeam?.name, m.league?.name);
        return {
          id: `football-${m.id}`,
          sport: 'football',
          home: m.homeTeam?.name,
          away: m.awayTeam?.name,
          competition: m.league?.name,
          venue: '',
          time: formatTimeSAST(m.date),
          date: dateStr,
          status: mapStatus(m.state?.description),
          result: m.state?.score?.current ? `${m.homeTeam?.name} ${m.state.score.current} ${m.awayTeam?.name}` : null,
          highlight, highlightLabel,
          source: 'highlightly',
        };
      });
  } catch { return []; }
}

function mapStatus(description) {
  if (!description) return 'upcoming';
  const d = description.toLowerCase();
  if (d.includes('finish')) return 'finished';
  if (d.includes('progress') || d.includes('play') || d.includes('half') ||
      d.includes('stumps') === false && (d.includes('live'))) return 'live';
  if (d.includes('scheduled') || d.includes('not started')) return 'upcoming';
  return 'upcoming';
}

// ── TheSportsDB: Tennis (Grand Slams) + F1 ──────────────────────────────────

const TSDB_LEAGUE_IDS = { tennis_grandslam: 4464, f1: 4370 };

export async function fetchFromSportsDB(dateStr) {
  const results = [];
  const promises = Object.entries(TSDB_LEAGUE_IDS).map(([key, id]) =>
    fetch(`/api/sportsdb?date=${dateStr}&leagueId=${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => ({ key, data }))
      .catch(() => null)
  );
  const responses = await Promise.allSettled(promises);
  responses.forEach(res => {
    if (res.status !== 'fulfilled' || !res.value?.data?.events) return;
    const { key, data } = res.value;
    data.events.forEach(ev => {
      const sport = key === 'f1' ? 'f1' : 'tennis';
      // Tennis: only Grand Slams
      if (sport === 'tennis') {
        const slam = ['australian open', 'french open', 'roland garros', 'wimbledon', 'us open']
          .some(s => (ev.strLeague || '').toLowerCase().includes(s) || (ev.strEvent || '').toLowerCase().includes(s));
        if (!slam) return;
      }
      const { highlight, highlightLabel } = getHighlight(ev.strHomeTeam, ev.strAwayTeam, ev.strLeague);
      results.push({
        id: `tsdb-${ev.idEvent}`,
        sport,
        home: ev.strHomeTeam || ev.strEvent?.split(' vs ')[0] || ev.strEvent,
        away: ev.strAwayTeam || ev.strEvent?.split(' vs ')[1] || '',
        competition: ev.strLeague,
        venue: ev.strVenue || '',
        time: formatTimeSASTFromTSDB(ev.strTime),
        date: ev.dateEvent,
        status: ev.strStatus === 'Match Finished' ? 'finished'
              : ev.strStatus === 'In Progress' ? 'live' : 'upcoming',
        result: ev.intHomeScore != null && ev.intAwayScore != null
          ? `${ev.strHomeTeam} ${ev.intHomeScore} – ${ev.intAwayScore} ${ev.strAwayTeam}`
          : null,
        highlight, highlightLabel,
        source: 'sportsdb',
      });
    });
  });
  return results;
}

function formatTimeSASTFromTSDB(strTime) {
  if (!strTime) return 'TBC';
  try {
    const [h, m] = strTime.split(':').map(Number);
    const sast = (h + 2) % 24;
    return `${String(sast).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  } catch { return 'TBC'; }
}

// ── Main orchestrator ─────────────────────────────────────────────────────

function sortFixtures(fixtures) {
  return fixtures.sort((a, b) => {
    const ta = (!a.time || a.time === 'TBC') ? '99:99' : a.time;
    const tb = (!b.time || b.time === 'TBC') ? '99:99' : b.time;
    return ta.localeCompare(tb);
  });
}

export async function fetchFixturesForDate(dateStr) {
  const [rugby, cricket, football, sportsDb] = await Promise.allSettled([
    fetchRugby(dateStr),
    fetchCricket(dateStr),
    fetchFootball(dateStr),
    fetchFromSportsDB(dateStr),
  ]);

  const all = [
    ...(rugby.status === 'fulfilled' ? rugby.value : []),
    ...(cricket.status === 'fulfilled' ? cricket.value : []),
    ...(football.status === 'fulfilled' ? football.value : []),
    ...(sportsDb.status === 'fulfilled' ? sportsDb.value : []),
  ];

  return sortFixtures(all);
}
