import React, { useState, useEffect, useCallback } from 'react';
import Settings from './components/Settings';
import FixtureCard from './components/FixtureCard';
import { fetchFixturesForDate, fmtDate, getDaysInView } from './services/fixtures';

function formatDayHeader(date) {
  return date.toLocaleDateString('en-ZA', {
    weekday: 'long', day: 'numeric', month: 'long',
    timeZone: 'Africa/Johannesburg',
  });
}

function isToday(date) {
  const t = new Date();
  return date.getDate() === t.getDate() &&
    date.getMonth() === t.getMonth() &&
    date.getFullYear() === t.getFullYear();
}

const SPORT_FILTERS = [
  { key: 'all',       label: 'All'       },
  { key: 'rugby',     label: '🏉 Rugby'  },
  { key: 'cricket',   label: '🏏 Cricket'},
  { key: 'football',  label: '⚽ Football'},
  { key: 'f1',        label: '🏎️ F1'    },
  { key: 'golf',      label: '⛳ Golf'   },
  { key: 'tennis',    label: '🎾 Tennis' },
  { key: 'athletics', label: '🏃 Athletics'},
];

export default function App() {
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('sa_sports_api_key') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [view, setView] = useState('weekend');
  const [sportFilter, setSportFilter] = useState('all');
  const [fixturesByDate, setFixturesByDate] = useState({});
  const [loading, setLoading] = useState({});
  const [errors, setErrors] = useState({});
  const [lastFetched, setLastFetched] = useState(null);

  const days = getDaysInView(view);

  const fetchDay = useCallback(async (date) => {
    const ds = fmtDate(date);
    setLoading(p => ({ ...p, [ds]: true }));
    setErrors(p => ({ ...p, [ds]: null }));
    try {
      const fixtures = await fetchFixturesForDate(ds, apiKey);
      setFixturesByDate(p => ({ ...p, [ds]: fixtures }));
      setLastFetched(new Date());
    } catch (err) {
      setErrors(p => ({ ...p, [ds]: err.message }));
    } finally {
      setLoading(p => ({ ...p, [ds]: false }));
    }
  }, [apiKey]);

  const fetchAll = useCallback(() => {
    setFixturesByDate({});
    days.forEach(d => fetchDay(d));
  }, [days, fetchDay]); // eslint-disable-line

  useEffect(() => { fetchAll(); }, [view, apiKey]); // eslint-disable-line

  function saveKey(k) {
    localStorage.setItem('sa_sports_api_key', k);
    setApiKey(k);
    setShowSettings(false);
  }

  const anyLoading = Object.values(loading).some(Boolean);
  const totalFixtures = Object.values(fixturesByDate).flat().length;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 0 5rem' }}>

      {/* ── Header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: '#0c0c0c', borderBottom: '1px solid #1a1a1a',
        padding: '0.8rem 1rem 0.6rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
          <div>
            <div style={{
              fontFamily: "'IBM Plex Mono', monospace",
              fontSize: '14px', fontWeight: 500, color: '#c8f542', letterSpacing: '0.02em',
            }}>
              SA SPORTS FIXTURES
            </div>
            <div style={{ fontSize: '11px', color: '#383838', marginTop: '2px' }}>
              {anyLoading
                ? '⏳ fetching…'
                : lastFetched
                  ? `updated ${lastFetched.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })} SAST`
                  : 'no data'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={fetchAll} title="Refresh" style={btnStyle('#1c1c1c', '#555')}>↻</button>
            <button onClick={() => setShowSettings(true)} style={btnStyle(
              apiKey ? '#0f2a06' : '#2a1500',
              apiKey ? '#c8f542' : '#f5a623',
              apiKey ? '#2a5a12' : '#5a3a06',
            )}>
              {apiKey ? '✓ API' : '⚠ API Key'}
            </button>
          </div>
        </div>

        {/* View tabs */}
        <div style={{ display: 'flex', gap: '4px', marginBottom: '0.5rem' }}>
          {[['today','Today'],['weekend','Weekend'],['week','This Week']].map(([v, label]) => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 500,
              border: 'none', cursor: 'pointer',
              background: view === v ? '#c8f542' : '#181818',
              color: view === v ? '#000' : '#555',
              transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>

        {/* Sport filter pills */}
        <div style={{ display: 'flex', gap: '4px', overflowX: 'auto', paddingBottom: '2px' }}>
          {SPORT_FILTERS.map(({ key, label }) => (
            <button key={key} onClick={() => setSportFilter(key)} style={{
              padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 500,
              border: `1px solid ${sportFilter === key ? '#c8f542' : '#222'}`,
              cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0,
              background: sportFilter === key ? '#0f2a06' : 'transparent',
              color: sportFilter === key ? '#c8f542' : '#444',
              transition: 'all 0.15s',
            }}>{label}</button>
          ))}
        </div>
      </div>

      {/* ── API Key Warning ── */}
      {!apiKey && (
        <div style={{
          margin: '0.8rem 1rem', padding: '10px 14px',
          background: '#1e1400', border: '1px solid #3a2800',
          borderRadius: '8px', fontSize: '12.5px', color: '#666', lineHeight: 1.7,
        }}>
          <strong style={{ color: '#f5a623' }}>⚠ Add your Anthropic API key</strong> to unlock full fixture coverage —
          SA cricket, schoolboy rugby, Grey College, Springboks, Diamond League, and more.{' '}
          <span onClick={() => setShowSettings(true)}
            style={{ color: '#c8f542', cursor: 'pointer', textDecoration: 'underline' }}>
            Set up →
          </span>
        </div>
      )}

      {/* ── Days ── */}
      {days.map(date => {
        const ds = fmtDate(date);
        const allFixtures = fixturesByDate[ds] || [];
        const fixtures = sportFilter === 'all'
          ? allFixtures
          : allFixtures.filter(f => f.sport === sportFilter);
        const isLoad = loading[ds];
        const err = errors[ds];
        const highlights = fixtures.filter(f => f.highlight);

        return (
          <div key={ds} style={{ marginTop: '1.2rem' }}>
            {/* Day header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '0 1rem 0.3rem',
            }}>
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: '11px', fontWeight: 500, letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: isToday(date) ? '#c8f542' : '#383838',
              }}>
                {isToday(date) ? '▸ ' : ''}{formatDayHeader(date)}
              </span>
              {!isLoad && fixtures.length > 0 && (
                <span style={{ fontSize: '10px', color: '#2a2a2a' }}>
                  {fixtures.length} fixture{fixtures.length !== 1 ? 's' : ''}
                  {highlights.length > 0 && (
                    <span style={{ color: '#3a5a14', marginLeft: '6px' }}>
                      · {highlights.length} key
                    </span>
                  )}
                </span>
              )}
            </div>

            {/* Loading spinner */}
            {isLoad && (
              <div style={{ padding: '1.5rem', textAlign: 'center' }}>
                <div style={{
                  display: 'inline-block', width: '16px', height: '16px',
                  border: '2px solid #1e1e1e', borderTopColor: '#c8f542',
                  borderRadius: '50%', animation: 'spin 0.7s linear infinite',
                }} />
              </div>
            )}

            {/* Error */}
            {err && !isLoad && (
              <div style={{
                margin: '0 1rem', padding: '10px 12px',
                background: '#1a0808', border: '1px solid #3a1010',
                borderRadius: '6px', fontSize: '12px', color: '#aa4444',
              }}>
                {err.includes('401') || err.toLowerCase().includes('auth')
                  ? '⚠ Invalid API key — check settings'
                  : `⚠ ${err}`}
              </div>
            )}

            {/* Fixture list */}
            {!isLoad && fixtures.length > 0 && (
              <div style={{
                margin: '0 1rem',
                border: '1px solid #1a1a1a', borderRadius: '8px', overflow: 'hidden',
              }}>
                {fixtures.map(f => <FixtureCard key={f.id} fixture={f} />)}
              </div>
            )}

            {/* Empty state */}
            {!isLoad && !err && fixtures.length === 0 && (
              <div style={{
                margin: '0 1rem', padding: '14px',
                border: '1px dashed #1a1a1a', borderRadius: '8px',
                fontSize: '12px', color: '#2a2a2a', textAlign: 'center',
              }}>
                {sportFilter !== 'all' ? `No ${sportFilter} fixtures` : 'Nothing scheduled'}
              </div>
            )}
          </div>
        );
      })}

      {/* Footer */}
      {!anyLoading && totalFixtures > 0 && (
        <div style={{ padding: '2rem 1rem 0', textAlign: 'center', fontSize: '11px', color: '#2a2a2a' }}>
          {totalFixtures} fixtures · All times SAST (UTC+2)
        </div>
      )}

      {showSettings && <Settings apiKey={apiKey} onSave={saveKey} onClose={() => setShowSettings(false)} />}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function btnStyle(bg, color, border) {
  return {
    background: bg, color, border: `1px solid ${border || '#2a2a2a'}`,
    borderRadius: '6px', padding: '5px 10px', fontSize: '12px',
    fontWeight: 500, cursor: 'pointer',
  };
}
