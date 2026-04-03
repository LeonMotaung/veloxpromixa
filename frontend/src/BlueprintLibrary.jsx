import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, ChevronRight, FileCode, Cpu, Layers } from 'lucide-react';
import GlassNavbar from './components/GlassNavbar';
import Footer from './components/Footer';

export default function BlueprintLibrary() {
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

  const blueprints = [
    { title: 'Standard Vision (CNN)', desc: 'Optimized 2D Convolutional Neural Network for generic image classification tasks.', category: 'Vision', icon: <Layers size={20} /> },
    { title: 'Transformer NLP', desc: 'Lightweight Transformer for text regression and classification sequences.', category: 'NLP', icon: <Book size={20} /> },
    { title: 'Tabular Auto (XGB)', desc: 'XGBoost with hyperparameter sweeps specifically for tabular CSV inputs.', category: 'AutoML', icon: <FileCode size={20} /> },
    { title: 'Anomaly Sieve', desc: 'Autoencoder architecture for unsupervised anomaly detection in streaming data.', category: 'Unsupervised', icon: <Cpu size={20} /> },
  ];

  return (
    <div style={{ position: 'relative', background: 'var(--background)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlassNavbar theme={theme} toggleTheme={toggleTheme} />

      <main className="container" style={{ flex: 1, marginTop: '8vh', marginBottom: '8vh' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: isMobile ? '32px' : '44px', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-1px' }}>Blueprint Library</h1>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Ready-to-run DSL templates to kickstart your training. Just import into the Dashboard and hit run.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
          {blueprints.map(bp => (
            <div key={bp.title} className="glass-panel" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', height: '100%', transition: 'transform 0.2s', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.transform='translateY(-4px)'} onMouseOut={e => e.currentTarget.style.transform='none'}>
              <div style={{ width: '40px', height: '40px', background: 'var(--glass)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: '16px' }}>
                {bp.icon}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '8px' }}>{bp.category}</div>
              <h3 style={{ margin: '0 0 12px', fontSize: '20px', fontWeight: 700 }}>{bp.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6, flex: 1 }}>{bp.desc}</p>
              
              <Link to="/dashboard" style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text)', textDecoration: 'none', fontWeight: 600, fontSize: '14px' }} className="nav-link">
                Use Template <ChevronRight size={16} />
              </Link>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
