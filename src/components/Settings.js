import React from 'react';

const s = {
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem',
  },
  panel: {
    background: '#141414', border: '1px solid #2a2a2a', borderRadius: '10px',
    padding: '2rem', width: '100%', maxWidth: '440px',
  },
  btn: {
    width: '100%', background: '#c8f542', color: '#000',
    border: 'none', borderRadius: '6px', padding: '0.65rem',
    fontWeight: 600, fontSize: '14px', cursor: 'pointer',
  },
  link: { color: '#c8f542', textDecoration: 'none' },
  hint: { fontSize: '12px', color: '#666', lineHeight: 1.7, marginBottom: '1rem' },
  title: { fontSize: '18px', fontWeight: 600, marginBottom: '0.3rem' },
  sub:   { fontSize: '13px', color: '#666', marginBottom: '1.25rem' },
  divider: { borderColor: '#2a2a2a', margin: '1.25rem 0' },
};

export default function Settings({ onClose }) {
  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={s.panel}>
        <div style={s.title}>⚙️ About this app</div>
        <div style={s.sub}>100% free — no API keys needed from you</div>

        <div style={s.hint}>
          <strong style={{ color: '#888' }}>Data sources:</strong><br />
          🏉 Rugby, 🏏 Cricket, ⚽ Football — Highlightly (free tier)<br />
          🎾 Tennis (Grand Slams), 🏎️ F1 — TheSportsDB (free)
        </div>

        <hr style={s.divider} />

        <div style={s.hint}>
          This app's free API keys are configured by the site owner as environment
          variables on Vercel — you don't need to enter anything here. If fixtures
          aren't loading, the owner may need to check their Highlightly dashboard
          for daily request limits (100/day per sport on the free tier).
        </div>

        <button style={s.btn} onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
