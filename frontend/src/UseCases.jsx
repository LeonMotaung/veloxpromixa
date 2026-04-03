import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Zap, Shield, Cpu, BarChart3, Cloud, Rocket, Layers, Menu, X, Sparkles } from 'lucide-react';
import Footer from './components/Footer';

const Nav = ({ theme, toggleTheme, isMobile, navOpen, setNavOpen }) => (
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
            VELOX <span style={{ color: 'var(--primary)' }}>PROXIMA</span>
          </div>
          <div style={{ fontSize: '11px', opacity: 0.6, letterSpacing: '0.8px' }}>AI ENGINE · USE CASES</div>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
            {[
              {label:'Home', to:'/'},
              {label:'Use Cases', to:'/use-cases'},
              {label:'Pricing', to:'/pricing'},
              {label:'Docs', to:'/docs'},
              {label:'Skills', to:'/skills'},
              {label:'Dashboard', to:'/dashboard'}
            ].map(item => (
              <Link key={item.label} to={item.to} style={{ position: 'relative', padding: '8px 10px', textDecoration: 'none', color: 'inherit', display: 'inline-flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}>
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
          <Link to="/dashboard" className="btn-primary" style={{ display: isMobile ? 'none' : 'inline-flex', textDecoration: 'none' }}>
            Launch Dashboard
          </Link>
          <button
            onClick={() => setNavOpen(!navOpen)}
            style={{ display: isMobile ? 'flex' : 'none', background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--text)', width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            aria-label="Toggle navigation"
          >
            {navOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>
    </div>
    {isMobile && navOpen && (
      <div style={{ background: 'var(--background)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px 16px', fontWeight: 600, fontSize: '14px' }}>
          {[
            {label:'Home', to:'/'},
            {label:'Use Cases', to:'/use-cases'},
            {label:'Pricing', to:'/pricing'},
            {label:'Docs', to:'/docs'},
            {label:'Skills', to:'/skills'},
            {label:'Dashboard', to:'/dashboard'}
          ].map(item => (
            <Link key={item.label} to={item.to} style={{ padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: 'var(--text)', background: 'var(--glass)', border: '1px solid var(--border)' }}>{item.label}</Link>
          ))}
        </div>
      </div>
    )}
  </header>
);

const useCaseCards = [
  {
    icon: <Layers size={18} />,
    title: 'Tabular ML · Finance & Ops',
    bullets: ['Fraud scoring pipelines', 'Churn & LTV models', 'Demand forecasting with holidays'],
    badge: 'STRUCTURED',
  },
  {
    icon: <Sparkles size={18} />,
    title: 'LLM Apps · Retrieval & Agents',
    bullets: ['RAG over private corp data', 'Action-taking agents with tools', 'Inline eval & guardrails'],
    badge: 'LLM',
  },
  {
    icon: <Cpu size={18} />,
    title: 'Vision · Edge & Cloud',
    bullets: ['Quality control on camera feeds', 'Defect detection (YOLO / ViT)', 'Distill to mobile binaries'],
    badge: 'VISION',
  },
  {
    icon: <Shield size={18} />,
    title: 'Security · Detection',
    bullets: ['Anomaly detection on logs', 'Access-risk scoring', 'Red-team / jailbreak sweeps via agents'],
    badge: 'SECURITY',
  },
  {
    icon: <BarChart3 size={18} />,
    title: 'Recommendations',
    bullets: ['Session-based ranking', 'Hybrid content + collaborative', 'Real-time re-scoring with features'],
    badge: 'RECS',
  },
  {
    icon: <Cloud size={18} />,
    title: 'MLOps / Scaling',
    bullets: ['GPU grid orchestration', 'Auto-sharding large models', 'One-binary deploys to mobile & edge'],
    badge: 'PLATFORM',
  }
];

const blueprints = [
  { name: 'csv_iris.vp', path: '/examples/csv_iris.vp', desc: 'Classic classification starter (tabular)' },
  { name: 'mnist_cnn.vp', path: '/examples/mnist_cnn.vp', desc: 'Convnet for images' },
  { name: 'mnist_transformer.vp', path: '/examples/mnist_transformer.vp', desc: 'Transformer variant for sequences' },
  { name: 'mnist_deep.vp', path: '/examples/mnist_deep.vp', desc: 'Deeper MLP stack for baselines' },
  { name: 'mnist_dense.vp', path: '/examples/mnist_dense.vp', desc: 'Lightweight dense baseline' },
];

export default function UseCases() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
  const [navOpen, setNavOpen] = useState(false);

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

  return (
    <div style={{ background: 'var(--background)', color: 'var(--text)', minHeight: '100vh' }}>
      <Nav theme={theme} toggleTheme={toggleTheme} isMobile={isMobile} navOpen={navOpen} setNavOpen={setNavOpen} />

      <main className="container" style={{ padding: isMobile ? '32px 0' : '56px 0', display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr', gap: '24px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '999px', background: 'var(--glass)', border: '1px solid var(--border)', fontSize: '12px' }}>
              <Zap size={14} color="var(--primary)" /> Zero-Friction AI Launchpad
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: 800, lineHeight: 1.1, margin: '16px 0' }}>
              Production use cases, from <span style={{ color: 'var(--primary)' }}>prototype</span> to <span className="purple-gradient-text">planet-scale</span>.
            </h1>
            <p style={{ fontSize: '15px', opacity: 0.7, lineHeight: 1.6 }}>
              Velox Proxima treats models, tensors, and external APIs as native citizens. Pick a blueprint, attach your data, and run it on laptop, cluster, or edge with the same DSL.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' }}>
              <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>Launch Dashboard</Link>
              <Link to="/docs" style={{ textDecoration: 'none', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: '10px', color: 'var(--text)', background: 'var(--glass)' }}>
                View DSL Docs
              </Link>
            </div>
          </div>
          <div style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '18px', padding: '20px', display: 'grid', gap: '12px' }}>
            {useCaseCards.slice(0,3).map((card) => (
              <div key={card.title} style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '14px', background: 'var(--background-alt)', display: 'flex', gap: '12px' }}>
                <div style={{ width: 38, height: 38, borderRadius: '10px', background: 'var(--glass)', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>{card.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700 }}>{card.title}</span>
                    <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '999px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>{card.badge}</span>
                  </div>
                  <ul style={{ margin: '8px 0 0', paddingLeft: '18px', opacity: 0.8, fontSize: '13px', lineHeight: 1.5 }}>
                    {card.bullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {useCaseCards.map((card) => (
            <div key={card.title} style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '16px', background: 'var(--glass)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'var(--background-alt)', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
                  {card.icon}
                </div>
                <div style={{ fontWeight: 700 }}>{card.title}</div>
              </div>
              <ul style={{ margin: 0, paddingLeft: '16px', opacity: 0.8, fontSize: '13px', lineHeight: 1.5 }}>
                {card.bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
              <div style={{ marginTop: '12px', fontSize: '11px', fontWeight: 700, color: 'var(--primary)' }}>{card.badge}</div>
            </div>
          ))}
        </section>

        <section style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', background: 'linear-gradient(135deg, rgba(59,130,246,0.18), rgba(14,165,233,0.14))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <Rocket size={18} color="var(--primary)" />
            <span style={{ fontWeight: 800 }}>Blueprints you can launch now</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
            {blueprints.map(bp => (
              <div key={bp.name} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', background: 'var(--background)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontWeight: 700 }}>{bp.name}</span>
                  <span style={{ fontSize: '11px', opacity: 0.6 }}>DSL</span>
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '13px', opacity: 0.75 }}>{bp.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '14px', fontSize: '12px', opacity: 0.75 }}>
            Tip: open any template in the Dashboard, swap the dataset, and hit “Run Blueprint”.
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 0.8fr', gap: '18px', alignItems: 'stretch' }}>
          <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', background: 'var(--glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Layers size={18} color="var(--primary)" />
              <span style={{ fontWeight: 800 }}>Agent patterns</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.6, fontSize: '13px', opacity: 0.85 }}>
              <li>Data Agents: ingest CSV/Parquet, profile schema, auto-suggest models.</li>
              <li>LLM Tools: bridge to ChatGPT/Claude as remote layers; auto choose cheapest/best.</li>
              <li>Observability: latency vs token-cost charts; thermal/load equilibrium hints.</li>
              <li>Guardrails: jail-break sweeps, PII scrubbers, content filters before deploy.</li>
            </ul>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: '14px', padding: '18px', background: 'var(--background-alt)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <Shield size={18} color="var(--primary)" />
              <span style={{ fontWeight: 800 }}>Deployment targets</span>
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.6, fontSize: '13px', opacity: 0.85 }}>
              <li>One-binary mobile/edge builds (Metal / CUDA / ROCm).</li>
              <li>Grid mode for multi-GPU sharding; auto-maps topology.</li>
              <li>Hybrid cloud: burst to remote GPUs when local equilibrium is exceeded.</li>
            </ul>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
