// Vercel serverless function — proxies requests to Highlightly's free APIs
// (rugby.highlightly.net, cricket.highlightly.net, soccer.highlightly.net)
// Keeps the API key server-side and avoids CORS issues in the browser.

const SPORT_HOSTS = {
  rugby: 'rugby.highlightly.net',
  cricket: 'cricket.highlightly.net',
  football: 'soccer.highlightly.net', // Highlightly names football "soccer"
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { sport, date } = req.query;
  const host = SPORT_HOSTS[sport];

  if (!host) {
    return res.status(400).json({ error: 'Invalid sport. Use rugby, cricket, or football.' });
  }
  if (!date) {
    return res.status(400).json({ error: 'Missing date parameter.' });
  }

  const apiKey = process.env.HIGHLIGHTLY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server is missing HIGHLIGHTLY_API_KEY env variable.' });
  }

  try {
    const url = `https://${host}/matches?date=${date}&timezone=Africa/Johannesburg`;
    const response = await fetch(url, {
      headers: { 'x-rapidapi-key': apiKey },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
