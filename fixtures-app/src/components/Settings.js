import React, { useState } from 'react';

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
  label: {
    display: 'block', fontSize: '11px', fontWeight: 500,
    letterSpacing: '0.08em', textTransform: 'uppercase',
    color: '#888', marginBottom: '0.5rem',
  },
  input: {
    width: '100%', background: '#0c0c0c', border: '1px solid #333',
    borderRadius: '6px', color: '#f0f0f0', padding: '0.6rem 0.75rem',
    fontSize: '13px', fontFamily: "'IBM Plex Mono', monospace",
    outline: 'none', marginBottom: '1rem',
  },
  btn: {
    width: '100%', background: '#c8f542', color: '#000',
    border: 'none', borderRadius: '6px', padding: '0.65rem',
    fontWeight: 600, fontSize: '14px', cursor: 'pointer',
  },
  link: { color: '#c8f542', textDecoration: 'none' },
  hint: { fontSize: '12px', color: '#555', lineHeight: 1.6, marginBottom: '1.25rem' },
  title: { fontSize: '18px', fontWeight: 600, marginBottom: '0.3rem' },
  sub:   { fontSize: '13px', color: '#666', marginBottom: '1.5rem' },
  divider: { borderColor: '#2a2a2a', margin: '1.25rem 0' },
};

export default function Settings({ apiKey, onSave, onClose }) {
  const [val, setVal] = useState(apiKey || '');
  const [show, setShow] = useState(false);

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div style={s.panel}>
        <div style={s.title}>⚙️ Settings</div>
        <div style={s.sub}>Connect your Anthropic API key to power fixture lookups</div>

        <label style={s.label}>Anthropic API Key</label>
        <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
          <input
            style={{ ...s.input, marginBottom: 0, paddingRight: '3rem' }}
            type={show ? 'text' : 'password'}
            placeholder="sk-ant-api03-..."
            value={val}
            onChange={e => setVal(e.target.value)}
            spellCheck={false}
          />
          <button
            onClick={() => setShow(p => !p)}
            style={{
              position: 'absolute', right: '0.6rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', color: '#555', fontSize: '12px', cursor: 'pointer',
            }}
          >{show ? 'hide' : 'show'}</button>
        </div>
        <div style={{ ...s.hint, marginBottom: '1.25rem' }}>
          Get a free key at{' '}
          <a href="https://console.anthropic.com" target="_blank" rel="noreferrer" style={s.link}>
            console.anthropic.com
          </a>
          . New accounts get $5 free credit — more than enough for daily fixture lookups.
          Your key is stored only in your browser.
        </div>

        <button style={s.btn} onClick={() => { if (val.trim()) onSave(val.trim()); }}>
          Save & continue
        </button>

        {onClose && (
          <button
            onClick={onClose}
            style={{ ...s.btn, background: 'transparent', color: '#666', border: '1px solid #2a2a2a', marginTop: '0.6rem' }}
          >
            Cancel
          </button>
        )}

        <hr style={s.divider} />
        <div style={s.hint}>
          <strong style={{ color: '#888' }}>Free sports APIs also used:</strong><br />
          TheSportsDB · ESPN feed · Open-Meteo (no keys needed)
        </div>
      </div>
    </div>
  );
}
