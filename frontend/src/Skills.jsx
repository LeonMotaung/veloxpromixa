import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Layers, Puzzle, BookOpen, PlugZap, Sparkles, Menu, X } from 'lucide-react';
import Footer from './components/Footer';

const skillsList = [
  {
    title: 'imagegen',
    tag: 'Visual',
    desc: 'Generate or edit raster images: photos, illustrations, sprites, textures.',
    actions: ['Create mockups', 'Produce hero images', 'Generate variants']
  },
  {
    title: 'openai-docs',
    tag: 'Docs',
    desc: 'Fetch official, up-to-date OpenAI API docs and guidance with citations.',
    actions: ['Model selection help', 'API parameter examples', 'Upgrade guidance']
  },
  {
    title: 'plugin-creator',
    tag: 'DevTools',
    desc: 'Scaffold a Codex plugin with the required plugin.json and starter files.',
    actions: ['Bootstrap plugin', 'Edit placeholders', 'Publish workflow']
  },
  {
    title: 'skill-creator',
    tag: 'DevTools',
    desc: 'Guide for authoring new skills, writing SKILL.md, and extending Codex.',
    actions: ['Author skill', 'Document workflow', 'Version tips']
  },
  {
    title: 'skill-installer',
    tag: 'Ops',
    desc: 'List/install curated skills or install directly from a GitHub repo.',
    actions: ['List catalogue', 'Install from repo', 'Keep skills updated']
  },
];

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
          <div style={{ fontSize: '11px', opacity: 0.6, letterSpacing: '0.8px' }}>AI ENGINE · SKILLS</div>
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

export default function Skills() {
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
        <section style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.1fr 0.9fr', gap: '20px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: '999px', background: 'var(--glass)', border: '1px solid var(--border)', fontSize: '12px' }}>
              <Puzzle size={14} color="var(--primary)" /> Extensible Skill Stack
            </div>
            <h1 style={{ fontSize: isMobile ? '32px' : '42px', fontWeight: 800, lineHeight: 1.1, margin: '16px 0' }}>
              Snap in new powers without touching the core.
            </h1>
            <p style={{ fontSize: '15px', opacity: 0.7, lineHeight: 1.6 }}>
              Velox Proxima skills are composable helpers: image generation, OpenAI docs, plugin scaffolding, and more. Install, call, and ship faster.
            </p>
            <div style={{ display: 'flex', gap: '12px', marginTop: '18px', flexWrap: 'wrap' }}>
              <Link to="/dashboard" className="btn-primary" style={{ textDecoration: 'none' }}>Launch Dashboard</Link>
              <Link to="/docs" style={{ textDecoration: 'none', border: '1px solid var(--border)', padding: '10px 16px', borderRadius: '10px', color: 'var(--text)', background: 'var(--glass)' }}>
                View Docs
              </Link>
            </div>
          </div>
          <div style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', background: 'var(--glass)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <Layers size={18} color="var(--primary)" />
              <span style={{ fontWeight: 800 }}>Available Skills</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
              {skillsList.map(skill => (
                <div key={skill.title} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', background: 'var(--background)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 700 }}>{skill.title}</span>
                    <span style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '999px', background: 'var(--primary-glow)', color: 'var(--primary)' }}>{skill.tag}</span>
                  </div>
                  <p style={{ margin: '8px 0', fontSize: '13px', opacity: 0.75 }}>{skill.desc}</p>
                  <ul style={{ margin: 0, paddingLeft: '16px', opacity: 0.8, fontSize: '12px', lineHeight: 1.5 }}>
                    {skill.actions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(59,130,246,0.12))' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <PlugZap size={18} color="var(--primary)" />
            <span style={{ fontWeight: 800 }}>How to install or call a skill</span>
          </div>
          <ol style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.6, fontSize: '13px', opacity: 0.85 }}>
            <li>Open Codex and run the skill: type the skill name (e.g., <code>openai-docs</code>) when relevant.</li>
            <li>For plugin-creator / skill-creator, follow the prompts to scaffold and edit files.</li>
            <li>Use imagegen when you need raster images; describe what you want (size, style, subject).</li>
            <li>Need API guidance? Call <code>openai-docs</code> to fetch fresh official references.</li>
          </ol>
        </section>

        <section style={{ border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', background: 'var(--glass)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <Sparkles size={18} color="var(--primary)" />
            <span style={{ fontWeight: 800 }}>Roadmap ideas</span>
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', lineHeight: 1.6, fontSize: '13px', opacity: 0.85 }}>
            <li>Data-profiler skill to infer schema, dtypes, and leakage checks.</li>
            <li>Model-eval skill with automatic splits and metric reports.</li>
            <li>Deployment skill to package one-binary builds for mobile/edge.</li>
          </ul>
        </section>
      </main>

      <Footer />
    </div>
  );
}

