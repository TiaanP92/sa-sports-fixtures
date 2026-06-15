import React, { useState } from 'react';

const SPORT_ICONS = {
  football: '⚽', rugby: '🏉', cricket: '🏏',
  tennis: '🎾', golf: '⛳', f1: '🏎️', athletics: '🏃',
};

const SPORT_LABELS = {
  football: 'Football', rugby: 'Rugby', cricket: 'Cricket',
  tennis: 'Tennis', golf: 'Golf', f1: 'F1', athletics: 'Athletics',
};

export default function FixtureCard({ fixture }) {
  const [open, setOpen] = useState(false);
  const icon = SPORT_ICONS[fixture.sport] || '🏅';
  const isLive = fixture.status === 'live';
  const isFinished = fixture.status === 'finished';
  const isHighlight = fixture.highlight;

  const highlightColor = fixture.highlightLabel?.includes('Grey') ? '#f5a623' : '#c8f542';
  const highlightBg    = fixture.highlightLabel?.includes('Grey') ? '#2a1d06'  : '#0f2a06';

  return (
    <div style={{
      borderBottom: '1px solid #1a1a1a',
      background: open ? '#141414' : 'transparent',
      borderLeft: isHighlight ? `3px solid ${highlightColor}` : '3px solid transparent',
      transition: 'background 0.15s',
    }}>
      {/* Compact row */}
      <div
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 12px 10px 10px', cursor: 'pointer',
        }}
      >
        {/* Sport icon */}
        <span style={{ fontSize: '14px', width: '20px', textAlign: 'center', flexShrink: 0 }}>
          {icon}
        </span>

        {/* Time */}
        <span style={{
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: '11px', color: isLive ? '#00e676' : '#444',
          width: '40px', flexShrink: 0,
        }}>
          {isLive ? 'LIVE' : (fixture.time || 'TBC')}
        </span>

        {/* Teams */}
        <span style={{ flex: 1, fontSize: '13px', color: isFinished ? '#666' : '#ddd', lineHeight: 1.35 }}>
          <span style={{ fontWeight: isHighlight ? 500 : 400 }}>
            {fixture.home}
          </span>
          <span style={{ color: '#333', margin: '0 5px' }}>vs</span>
          <span style={{ fontWeight: isHighlight ? 500 : 400 }}>
            {fixture.away}
          </span>
          {fixture.result && (
            <span style={{
              display: 'inline-block', marginLeft: '8px',
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '11px', color: '#555',
            }}>
              ({fixture.result.match(/\d+ – \d+/)?.[0] || ''})
            </span>
          )}
          {fixture.notes && (
            <span style={{ display: 'block', fontSize: '11px', color: '#444', marginTop: '1px' }}>
              {fixture.notes}
            </span>
          )}
        </span>

        {/* Highlight badge */}
        {isHighlight && fixture.highlightLabel && (
          <span style={{
            fontSize: '10px', padding: '2px 7px', borderRadius: '20px',
            background: highlightBg, color: highlightColor,
            fontWeight: 500, flexShrink: 0, whiteSpace: 'nowrap',
          }}>
            {fixture.highlightLabel}
          </span>
        )}

        {/* Chevron */}
        <span style={{
          fontSize: '11px',
          color: open ? '#c8f542' : '#2a2a2a',
          flexShrink: 0,
          transform: open ? 'rotate(180deg)' : 'none',
          display: 'inline-block',
          transition: 'transform 0.2s, color 0.15s',
        }}>▾</span>
      </div>

      {/* Expanded detail */}
      {open && (
        <div style={{
          padding: '2px 12px 14px 76px',
          fontSize: '12px', color: '#555', lineHeight: 2.1,
        }}>
          {fixture.competition && (
            <div>
              <span style={{ marginRight: '8px' }}>🏆</span>
              <span style={{ color: '#777' }}>{fixture.competition}</span>
            </div>
          )}
          {fixture.venue && (
            <div>
              <span style={{ marginRight: '8px' }}>🏟️</span>
              <span style={{ color: '#777' }}>{fixture.venue}</span>
            </div>
          )}
          {fixture.home && fixture.away && (
            <div>
              <span style={{ marginRight: '8px' }}>👕</span>
              <span style={{ color: '#777' }}>{fixture.home} vs {fixture.away}</span>
            </div>
          )}
          {fixture.result && (
            <div style={{
              marginTop: '6px', padding: '5px 10px',
              background: '#0f0f0f', borderRadius: '5px',
              fontFamily: "'IBM Plex Mono', monospace",
              color: '#c8f542', fontSize: '12px', display: 'inline-block',
            }}>
              {fixture.result}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
