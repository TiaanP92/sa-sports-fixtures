// Vercel serverless function — proxies requests to TheSportsDB
// Bypasses CORS restrictions that block direct browser requests

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { date, leagueId } = req.query;

  if (!date || !leagueId) {
    return res.status(400).json({ error: 'Missing date or leagueId' });
  }

  try {
    const url = `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${date}&l=${leagueId}`;
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: 'TheSportsDB error' });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
