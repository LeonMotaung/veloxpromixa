import React, { useEffect, useState } from 'react';
import { Key, Shield, Copy, Eye, Plus, EyeOff } from 'lucide-react';
import GlassNavbar from './components/GlassNavbar';
import Footer from './components/Footer';

export default function ApiKeys() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showKey, setShowKey] = useState(false);

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

  const apiKey = 'vpx_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';

  return (
    <div style={{ position: 'relative', background: 'var(--background)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlassNavbar theme={theme} toggleTheme={toggleTheme} />

      <main className="container" style={{ flex: 1, marginTop: '8vh', marginBottom: '8vh', maxWidth: '800px' }}>
        <div className="glass-panel" style={{ padding: isMobile ? '20px' : '40px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Key size={24} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>API Keys</h1>
              <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginTop: '4px' }}>Integrate Velox Proxima with your external tools</div>
            </div>
          </div>

          <div style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 600 }}>Master Secret Key</h3>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>Do not share this key with anyone. It has full access to your resources.</p>
            
            <div style={{ display: 'flex', background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
              <input 
                type={showKey ? 'text' : 'password'} 
                value={apiKey} 
                readOnly 
                style={{ flex: 1, border: 'none', background: 'transparent', padding: '16px', fontFamily: '"Fira Code", monospace', color: 'var(--text)', outline: 'none' }}
              />
              <button 
                onClick={() => setShowKey(!showKey)} 
                style={{ background: 'transparent', border: 'none', borderLeft: '1px solid var(--border)', padding: '0 16px', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              <button 
                onClick={() => navigator.clipboard.writeText(apiKey)} 
                style={{ background: 'var(--primary)', border: 'none', padding: '0 20px', cursor: 'pointer', color: '#fff', fontWeight: 600 }}
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
             <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Roll Keys</h3>
             <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px' }}><Plus size={16} /> Generate New</button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: 'rgba(34,197,94,0.1)', padding: '16px', borderRadius: '12px', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
             <Shield size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
             <div style={{ fontSize: '13px', lineHeight: 1.5 }}>
               <strong>Security Guardrails Active.</strong> All API calls made with your keys are automatically monitored for excessive usage and protected against basic injection attacks by our internal HTTP siphon.
             </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
