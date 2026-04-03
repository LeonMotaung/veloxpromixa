import React, { useEffect, useState } from 'react';
import { Activity, Server, Clock, CheckCircle2 } from 'lucide-react';
import GlassNavbar from './components/GlassNavbar';
import Footer from './components/Footer';

export default function Status() {
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

  const services = [
    { name: 'Core API Gateway', status: 'Operational', uptime: '99.99%', lat: '24ms' },
    { name: 'Training Engine', status: 'Operational', uptime: '99.95%', lat: 'N/A' },
    { name: 'Dashboard Interface', status: 'Operational', uptime: '100%', lat: '12ms' },
    { name: 'Model Inference Zoo', status: 'Operational', uptime: '99.98%', lat: '45ms' },
  ];

  return (
    <div style={{ position: 'relative', background: 'var(--background)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlassNavbar theme={theme} toggleTheme={toggleTheme} />

      <main className="container" style={{ flex: 1, marginTop: '8vh', marginBottom: '8vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
           <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderRadius: '40px', fontWeight: 800, fontSize: '16px', border: '1px solid rgba(34,197,94,0.2)', marginBottom: '24px' }}>
              <CheckCircle2 size={20} /> All Systems Operational
           </div>
           <h1 style={{ fontSize: isMobile ? '32px' : '44px', fontWeight: 800, margin: '0 0 12px' }}>System Status</h1>
           <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>Live updates and historical uptime for the Velox Proxima infrastructure network.</p>
        </div>

        <div className="glass-panel" style={{ padding: isMobile ? '16px' : '32px', borderRadius: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '32px' }}>
             <div style={{ padding: '20px', background: 'var(--glass)', borderRadius: '16px', border: '1px solid var(--border)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                 <Server size={18} /> Edge Instances
               </div>
               <div style={{ fontSize: '32px', fontWeight: 800 }}>24,081</div>
             </div>
             <div style={{ padding: '20px', background: 'var(--glass)', borderRadius: '16px', border: '1px solid var(--border)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                 <Clock size={18} /> Avg Deployment Time
               </div>
               <div style={{ fontSize: '32px', fontWeight: 800 }}>800ms</div>
             </div>
             <div style={{ padding: '20px', background: 'var(--glass)', borderRadius: '16px', border: '1px solid var(--border)' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                 <Activity size={18} /> Requests / Sec
               </div>
               <div style={{ fontSize: '32px', fontWeight: 800 }}>~4.5k</div>
             </div>
          </div>

          <h3 style={{ margin: '0 0 20px', fontSize: '20px', fontWeight: 700 }}>Service Metrics</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {services.map(s => (
               <div key={s.name} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', padding: '20px', background: 'var(--background-alt)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '200px' }}>
                     <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px rgba(34,197,94,0.4)' }}></div>
                     <span style={{ fontSize: '16px', fontWeight: 600 }}>{s.name}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px', opacity: 0.8, fontSize: '14px' }}>
                     <span>Uptime: {s.uptime}</span>
                     <span>Latency: {s.lat}</span>
                  </div>
               </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
