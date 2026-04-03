import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Trash2, Rocket, DollarSign, CheckCircle2, BarChart3, Copy, ExternalLink } from 'lucide-react';
import axios from 'axios';

export default function Admin() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [navOpen, setNavOpen] = useState(false);
  const [runs, setRuns] = useState([]);
  const [deployInfo, setDeployInfo] = useState(null);
  const [usage, setUsage] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const fetchRuns = async () => {
    try {
      const res = await axios.get('/api/runs');
      setRuns(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsage = () => {
    // Placeholder monthly usage data in dollars; replace with real endpoint when available.
    const days = Array.from({ length: 30 }, (_, i) => i + 1);
    setUsage(days.map(d => ({ day: d, spend: Math.max(0, 20 + 5 * Math.sin(d / 4) + Math.random() * 3) })));
  };

  useEffect(() => {
    fetchRuns();
    fetchUsage();
  }, []);

  const handleDeploy = async (jobId) => {
    try {
      const res = await axios.post(`/api/deploy/${jobId}`);
      setDeployInfo(res.data);
    } catch (e) {
      alert(`Deploy failed: ${e.response?.data?.detail || e.message}`);
    }
  };

  const handleReject = (jobId) => {
    setRuns(prev => prev.filter(r => r.job_id !== jobId));
  };

  const copyEndpoint = () => {
    if (!deployInfo) return;
    const text = `POST ${deployInfo.endpoint}\nBody: ${deployInfo.body}`;
    navigator.clipboard.writeText(text);
  };

  return (
    <div style={{ background: 'var(--background)', color: 'var(--text)', minHeight: '100vh' }}>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, backdropFilter: 'blur(12px)', background: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '12px 16px' : '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Link to="/" style={{ padding: '8px', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <img
                src={theme === 'dark' ? '/images/onblack.png' : '/images/onwhite.png'}
                alt="Velox Logo"
                style={{ width: '22px', height: '22px', objectFit: 'contain' }}
              />
            </Link>
            <div>
              <div style={{ margin: 0, fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px' }} className="neon-text">
                VELOX <span style={{ color: 'var(--primary)' }}>ADMIN</span>
              </div>
              <div style={{ fontSize: '11px', opacity: 0.6, letterSpacing: '0.8px' }}>Model control plane</div>
            </div>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {!isMobile && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
                {[
                  { label: 'Home', to: '/' },
                  { label: 'Dashboard', to: '/dashboard' },
                  { label: 'Pricing', to: '/pricing' },
                  { label: 'Use Cases', to: '/use-cases' },
                  { label: 'Skills', to: '/skills' }
                ].map(item => (
                  <Link key={item.label} to={item.to} style={{ padding: '8px 10px', textDecoration: 'none', color: 'inherit', borderRadius: '8px' }}>
                    <span className="nav-link">{item.label}</span>
                  </Link>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={toggleTheme}
                style={{
                  background: 'var(--glass)',
                  border: '1px solid var(--border)',
                  color: 'var(--text)',
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      <main className="container" style={{ padding: isMobile ? '28px 0' : '42px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr', gap: '16px' }}>
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <BarChart3 size={18} color="var(--primary)" />
              <span style={{ fontWeight: 700 }}>Monthly Spend</span>
            </div>
            <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '10px' }}>USD, current month (placeholder data).</div>
            <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
              {usage.map(u => (
                <div key={u.day} title={`Day ${u.day}: $${u.spend.toFixed(2)}`} style={{ flex: 1, background: 'var(--primary-glow)', height: `${u.spend * 2}px`, minHeight: '4px', borderRadius: '4px' }} />
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px', opacity: 0.6 }}>
              <span>Day 1</span><span>Day 30</span>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DollarSign size={18} color="var(--primary)" />
              <span style={{ fontWeight: 700 }}>API Usage</span>
            </div>
            <div style={{ fontSize: '13px', opacity: 0.7 }}>
              Hook this to your billing/metrics source; placeholder shows static estimates until backend usage is added.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div className="glass-panel" style={{ padding: '12px' }}>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>This month (est.)</div>
                <div style={{ fontSize: '22px', fontWeight: 800 }}>$ {(usage.reduce((a,b)=>a+b.spend,0)).toFixed(2)}</div>
              </div>
              <div className="glass-panel" style={{ padding: '12px' }}>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>Avg / day</div>
                <div style={{ fontSize: '22px', fontWeight: 800 }}>$ {(usage.reduce((a,b)=>a+b.spend,0)/Math.max(1,usage.length)).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel" style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <Rocket size={18} color="var(--primary)" />
            <span style={{ fontWeight: 700 }}>Model Registry</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead style={{ textAlign: 'left', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '10px' }}>Job</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Source</th>
                  <th style={{ padding: '10px' }}>Test Acc</th>
                  <th style={{ padding: '10px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {runs.map(run => (
                  <tr key={run.job_id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px', fontWeight: 600 }}>{run.job_id}</td>
                    <td style={{ padding: '10px' }}>{run.status}</td>
                    <td style={{ padding: '10px', maxWidth: '260px', whiteSpace: 'pre-wrap', opacity: 0.7 }}>{(run.source || '').slice(0, 180)}{(run.source || '').length > 180 ? '…' : ''}</td>
                    <td style={{ padding: '10px' }}>{run.results?.test_accuracy ?? '—'}</td>
                    <td style={{ padding: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button className="btn-primary" style={{ padding: '8px 12px' }} onClick={() => handleDeploy(run.job_id)}>
                        Deploy
                      </button>
                      <button className="btn-primary" style={{ padding: '8px 12px', background: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border)' }} onClick={() => handleReject(run.job_id)}>
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {deployInfo && (
          <section className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <CheckCircle2 size={18} color="var(--primary)" />
              <span style={{ fontWeight: 700 }}>Deploy Ready</span>
            </div>
            <div style={{ fontSize: '13px', opacity: 0.75, marginBottom: '8px' }}>
              Endpoint: <code style={{ background: 'var(--glass)', padding: '4px 6px', borderRadius: '6px' }}>{deployInfo.endpoint}</code>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ padding: '10px 12px' }} onClick={copyEndpoint}>
                <Copy size={14} /> Copy endpoint
              </button>
              <pre style={{ margin: 0, background: 'var(--glass)', padding: '10px', borderRadius: '10px', fontSize: '12px', whiteSpace: 'pre-wrap', maxWidth: '100%' }}>
{deployInfo.example_curl}
              </pre>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

