import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Sparkles, Shield, Cpu } from 'lucide-react';
import GlassNavbar from './components/GlassNavbar';
import Footer from './components/Footer';

const features = [
  { icon: <Zap size={24} />, title: 'Equilibrium Scheduler', desc: 'Balances cost, latency, and thermal load across local + cloud automatically.' },
  { icon: <Sparkles size={24} />, title: 'One-Command Deploy', desc: 'Train a Blueprint, get an endpoint + cURL instantly—no MLOps glue.' },
  { icon: <Shield size={24} />, title: 'Guardrails & Observability', desc: 'Cost caps, jailbreak sweeps, live loss/latency dashboards out of the box.' },
  { icon: <Cpu size={24} />, title: 'One-Binary Edge', desc: 'Compile to native binaries for Metal/CUDA/ROCm—zero Python runtime.' },
];

export default function Home() {
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

  return (
    <div style={{ position: 'relative', background: 'var(--background)', color: 'var(--text)' }}>
      <GlassNavbar theme={theme} toggleTheme={toggleTheme} />

      <main>
        {/* Hero */}
        <section className="container" style={{ marginTop: '8vh', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.05fr 0.95fr', gap: '32px', alignItems: 'center' }}>
          <div>
            <div className="btn-primary" style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: '40px', fontSize: '12px', marginBottom: '16px', letterSpacing: '1px', opacity: 0.9 }}>
              {theme === 'dark' ? 'NIGHT MODE ACTIVE' : 'DAY MODE READY'}
            </div>
            <h1 style={{ fontSize: isMobile ? '46px' : '64px', fontWeight: 800, margin: 0, letterSpacing: '-2px', lineHeight: 1.05 }}>
              Velox Proxima.<br /> Deploy AI without the ops tax.
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginTop: '18px', maxWidth: '620px', lineHeight: 1.6 }}>
              Train, route, and deploy from one Blueprint. Equilibrium keeps GPUs cool, bills low, and latency tight—whether you’re on laptop, cluster, or edge.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '22px' }}>
              <Link to="/dashboard" className="btn-primary" style={{ padding: '14px 28px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                Launch Dashboard <ChevronRight size={18} />
              </Link>
              <Link to="/docs" style={{ textDecoration: 'none', border: '1px solid var(--border)', padding: '12px 18px', borderRadius: '12px', color: 'var(--text)', background: 'var(--glass)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                View DSL Docs
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="glass-panel" style={{ padding: isMobile ? '14px' : '18px', borderRadius: '20px', backdropFilter: 'blur(16px)', boxShadow: '0 30px 70px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 6px rgba(34,197,94,0.18)' }}></span>
              <span style={{ fontFamily: 'Fira Code, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>Equilibrium Console</span>
            </div>
            <div className="glass-panel" style={{ padding: '12px', marginBottom: '10px', borderRadius: '14px' }}>
              <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '12px', color: 'var(--text)' }}>
                grid &#123; encoder: local, decoder: gpu0 &#125;<br />
                cost_ceiling = $0.08/run<br />
                thermal_guard = on<br />
                route chat =&gt; local | ChatGPT proxy (guardrails)
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '12px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '12px', color: 'var(--text)' }}>layer Conv2D (32, 3)</div>
              <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '12px', color: 'var(--text)' }}>layer Dense (INFER)</div>
              <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '12px', color: 'var(--text)' }}>train on sample_iris.csv</div>
              <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '12px', color: 'var(--text)' }}>optimizer adamw lr=0.0008</div>
              <div style={{ marginTop: '6px', display: 'flex', gap: '8px' }}>
                <span className="btn-primary" style={{ padding: '8px 12px', fontSize: '12px' }}>Run</span>
                <span className="btn-primary" style={{ padding: '8px 12px', fontSize: '12px', background: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border)' }}>Deploy</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container" style={{ marginTop: '14vh' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '14px', letterSpacing: '2px', fontWeight: 700, opacity: 0.6 }}>WHY VELOX</div>
            <h2 style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: 800, margin: '6px 0 0' }}>Speed, control, and lower GPU bills.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {features.map((f) => (
              <div key={f.title} className="glass-panel" style={{ padding: '14px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--glass)', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: 700 }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
