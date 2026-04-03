import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Database, Search, Activity, Layers, Download, LayoutGrid } from 'lucide-react';
import GlassNavbar from './components/GlassNavbar';
import Footer from './components/Footer';

export default function ModelRegistry() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const models = [
    { id: 'vpx-7b-chat', name: 'VPX-7B Chat Proxy', type: 'LLM Proxy', param: '7B', acc: '98.2%', status: 'Active' },
    { id: 'resnet-50-mnist', name: 'MNIST ResNet-50', type: 'Vision', param: '23M', acc: '99.1%', status: 'Active' },
    { id: 'xgboost-tabular', name: 'Tabular Default (XGB)', type: 'AutoML', param: 'N/A', acc: '94.5%', status: 'Archived' },
  ];

  return (
    <div style={{ position: 'relative', background: 'var(--background)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlassNavbar theme={theme} toggleTheme={toggleTheme} />

      <main className="container" style={{ flex: 1, marginTop: '8vh', marginBottom: '8vh' }}>
        <div style={{ padding: isMobile ? '16px' : '32px' }} className="glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <Database size={32} color="var(--primary)" />
            <h1 style={{ margin: 0, fontSize: isMobile ? '28px' : '36px', fontWeight: 800 }}>Model Registry</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '600px', lineHeight: 1.6, marginBottom: '32px' }}>
            Manage, version, and deploy trained models across local and cloud environments automatically. 
          </p>

          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
              <input type="text" placeholder="Search registry..." style={{ width: '100%', padding: '12px 12px 12px 40px', background: 'var(--background-alt)', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text)' }} />
            </div>
            <button className="btn-primary" style={{ padding: '12px 24px' }}>Filter</button>
          </div>

          <div style={{ width: '100%', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Model ID</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Name</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Type</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Accuracy</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '12px', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map(m => (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border)', transition: 'background 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.background='var(--glass)'} onMouseOut={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding: '16px 12px', fontFamily: '"Fira Code", monospace', fontSize: '13px' }}>{m.id}</td>
                    <td style={{ padding: '16px 12px', fontWeight: 600 }}>{m.name}</td>
                    <td style={{ padding: '16px 12px', color: 'var(--text-muted)' }}>{m.type}</td>
                    <td style={{ padding: '16px 12px' }}>{m.acc}</td>
                    <td style={{ padding: '16px 12px' }}>
                      <span style={{ display: 'inline-flex', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 700, background: m.status === 'Active' ? 'rgba(34,197,94,0.15)' : 'rgba(156,163,175,0.15)', color: m.status === 'Active' ? '#22c55e' : 'var(--text-muted)' }}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 12px' }}>
                      <button style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: '4px' }}>
                        <Download size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
