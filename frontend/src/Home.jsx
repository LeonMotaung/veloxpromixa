import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Cpu, 
  Shield, 
  ChevronRight, 
  Activity, 
  Database,
  Terminal,
  Grid,
  Sparkles,
  Smartphone,
  Cloud,
  MessageSquare,
  Globe,
  Settings,
  Layout,
  Sun,
  Moon,
  Github,
  Award,
  ChevronDown,
  ExternalLink,
  Code2
} from 'lucide-react';

export default function Home() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div style={{ position: 'relative' }}>
      
      {/* Theme Toggle Button - Fixed Top Right */}
      <div style={{ position: 'fixed', top: '24px', right: '32px', zIndex: 100 }}>
         <button 
           onClick={toggleTheme}
           style={{ 
             background: 'var(--glass)', 
             border: '1px solid var(--border)', 
             color: 'var(--text)', 
             width: '40px', 
             height: '40px', 
             borderRadius: '50%',
             display: 'flex',
             alignItems: 'center',
             justifyContent: 'center',
             cursor: 'pointer',
             backdropFilter: 'blur(8px)',
             transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
           }}
           className="theme-btn"
         >
           {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
         </button>
      </div>

      {/* Navbar */}
      <nav className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '32px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img 
            src={theme === 'dark' ? '/images/onblack.png' : '/images/onwhite.png'} 
            alt="Velox Logo" 
            style={{ width: '32px', height: '32px', objectFit: 'contain' }}
          />
          <span style={{ fontWeight: 800, fontSize: '20px', letterSpacing: '-1px' }}>VELOX <span style={{ color: 'var(--primary)' }}>PROXIMA</span></span>
        </div>
        <div style={{ display: 'flex', gap: '32px', fontSize: '14px', fontWeight: 600, opacity: 0.8 }}>
          <Link to="/docs/DSL_GUIDE" style={{ color: 'var(--text)', textDecoration: 'none' }}>DOCUMENTATION</Link>
          <Link to="/dashboard" style={{ color: 'var(--primary)', textDecoration: 'none' }}>LAUNCH DASHBOARD</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container" style={{ marginTop: '10vh', textAlign: 'center' }}>
          <div className="btn-primary" style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: '40px', fontSize: '12px', marginBottom: '32px', letterSpacing: '1px', opacity: 0.9 }}>
            {theme === 'dark' ? 'NIGHT MODE ACTIVE' : 'DAY MODE READY'}
          </div>
          
          <h1 style={{ fontSize: '72px', fontWeight: 800, margin: 0, letterSpacing: '-4px', lineHeight: 1.0 }}>
            The AI Engine That <br />
            <span className="purple-gradient-text">Actually Thinks</span> First.
          </h1>
          
          <p style={{ fontSize: '20px', color: 'var(--text-muted)', marginTop: '32px', maxWidth: '650px', margin: '32px auto 0', lineHeight: 1.6 }}>
            Velox Proxima is an enterprise-grade declarative AI ecosystem. 
            Write human-readable Blueprints, solve neural geometry instantly, and scale your agents everywhere.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '48px' }}>
            <Link to="/dashboard" className="btn-primary" style={{ padding: '16px 40px', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              GET STARTED <ChevronRight size={20} />
            </Link>
          </div>
      </section>

      {/* Quick Start Card */}
      <section className="container" style={{ marginTop: '10vh' }}>
          <div className="glass-panel" style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
             <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', opacity: 0.6, fontSize: '12px', fontWeight: 800, letterSpacing: '2px' }}>
                 <span>QUICK START</span>
                 <span>ONE-LINER</span>
                 <span style={{ color: 'var(--primary)' }}>POWERSHELL / TERMINAL</span>
             </div>
             <div style={{ fontSize: '24px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: 'var(--primary)' }}>⟩</span> Works everywhere. Installs everything. <Shield size={24} color="var(--primary)" />
             </div>
             <pre style={{ 
               background: '#000', 
               padding: '24px', 
               borderRadius: '12px', 
               color: 'var(--accent)', 
               fontFamily: 'Fira Code', 
               fontSize: '14px',
               border: '1px solid var(--border)',
               overflow: 'hidden',
               whiteSpace: 'pre-wrap'
             }}>
                powershell -c "irm https://veloxproxima.ai/install.ps1 | iex"
             </pre>
             <p style={{ marginTop: '24px', fontSize: '14px', opacity: 0.6 }}>
                Works on macOS, Windows & Linux. The one-liner installs Node.js, Python, and the Velox Compiler for you.
             </p>
          </div>
      </section>

      {/* [BETA SECTION] */}
      <section className="container" style={{ marginTop: '10vh' }}>
          <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <div style={{ fontSize: '40px', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px' }}>β</div>
              <h2 style={{ fontSize: '32px', fontWeight: 800 }}>Engine Beta Capability</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '32px' }}>
             <FeatureCard 
               icon={<Smartphone size={32} />} 
               title="Runs on Your Machine" 
               desc="Private by default. Works with Anthropic, OpenAI, or 100% local models. Your data stays yours." 
             />
             <FeatureCard 
               icon={<MessageSquare size={32} />} 
               title="Any Chat App" 
               desc="Talk to Velox on WhatsApp, Discord, Slack, or Telegram. Works in DMs and group shards." 
             />
             <FeatureCard 
               icon={<Database size={32} />} 
               title="Persistent Memory" 
               desc="The engine remembers you and becomes uniquely yours. Your preferences, your context, your AI." 
             />
             <FeatureCard 
               icon={<Globe size={32} />} 
               title="Browser Control" 
               desc="Automate the web. Extract data, fill forms, and browse with deterministic precision." 
             />
             <FeatureCard 
               icon={<Settings size={32} />} 
               title="Full System Access" 
               desc="Read and write files, run shell commands, execute scripts. Secure or sandboxed—your choice." 
             />
             <FeatureCard 
               icon={<Sparkles size={32} />} 
               title="Skills & Plugins" 
               desc="Extend with the Sieve registry or build your own. The engine can even learn new methods dynamically." 
             />
          </div>
      </section>

      {/* Integrations Marquee */}
      <section style={{ marginTop: '15vh', backgroundColor: 'var(--background-alt)', padding: '80px 0', borderTop: '1px solid var(--border)' }}>
          <div className="container" style={{ textAlign: 'center', marginBottom: '40px' }}>
             <h3 style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '4px', opacity: 0.4 }}>WORKS WITH EVERYTHING</h3>
          </div>
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', display: 'flex' }}>
             <MarqueeRow 
               items={['WhatsApp','Telegram','Discord','Slack','Signal','Claude','GPT','Spotify','Obsidian','GitHub','VS Code']} 
             />
          </div>
          <div className="container" style={{ marginTop: '40px', textAlign: 'center' }}>
             <Link to="/docs" style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                View all 50+ integrations <ChevronRight size={16} />
             </Link>
          </div>
      </section>

      {/* Featured In / Testimonials */}
      <section className="container" style={{ marginTop: '15vh' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '48px' }}>
             <Testimonial 
               author="Federico Viticci" 
               role="MacStories" 
               quote="Velox showed me what the future of personal AI assistants looks like." 
             />
             <Testimonial 
               author="Jim Mendenhall" 
               role="StarryHope" 
               quote="The future of private AI: Why developers are scaling local clusters for Velox." 
             />
          </div>
      </section>

      {/* CTA Footer */}
      <section style={{ marginTop: '15vh', borderTop: '1px solid var(--border)', padding: '100px 0 60px' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '40px' }}>
             <div style={{ gridColumn: 'span 2' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                  <Activity size={24} color="var(--primary)" />
                  <span style={{ fontWeight: 800, fontSize: '20px' }}>VELOX</span>
                </div>
                <p style={{ opacity: 0.5, fontSize: '14px', lineHeight: 1.6 }}>
                  Built by Space Lobster AI with a soul. Independent project focused on privacy and performance. 
                  Not affiliated with Anthropic. Formerly known as Proxima.
                </p>
             </div>
             
             <FooterCol title="Community" links={[
               {name: 'Discord', href: '#'},
               {name: 'GitHub', href: '#'},
               {name: 'ClawHub', href: '#'}
             ]} />
             
             <FooterCol title="Resources" links={[
               {name: 'Documentation', href: '/docs'},
               {name: 'Benchmarks', href: '#'},
               {name: 'Registry', href: '#'}
             ]} />

             <div>
                <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '20px', letterSpacing: '1px' }}>STAY IN THE LOOP</h4>
                <div style={{ display: 'flex', gap: '8px' }}>
                   <input 
                     placeholder="your@email.com" 
                     style={{ background: 'var(--glass)', border: '1px solid var(--border)', color: 'white', padding: '12px', borderRadius: '8px', fontSize: '14px', flex: 1 }} 
                   />
                   <button className="btn-primary" style={{ padding: '0 16px' }}><ChevronRight size={20} /></button>
                </div>
             </div>
          </div>

          {/* Sponsors */}
          <div className="container" style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.4 }}>
             <div style={{ display: 'flex', gap: '40px', fontSize: '12px', fontWeight: 800 }}>
                <span>NVIDIA</span>
                <span>VERCEL</span>
                <span>CONVEX</span>
                <span>OPENAI</span>
             </div>
             <div style={{ fontSize: '11px' }}>Built by Peter Steinberger & Community.</div>
          </div>
      </section>

      <style>{`
        .theme-btn:hover { transform: scale(1.1); }
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .purple-gradient-text {
            background: linear-gradient(to right, var(--text), var(--primary));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }
      `}</style>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="glass-panel" style={{ padding: '32px' }}>
       <div style={{ color: 'var(--primary)', marginBottom: '24px' }}>{icon}</div>
       <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px' }}>{title}</h3>
       <p style={{ opacity: 0.6, fontSize: '14px', lineHeight: 1.6 }}>{desc}</p>
    </div>
  );
}

function Testimonial({ author, role, quote }) {
  return (
    <div>
       <div style={{ fontSize: '24px', fontWeight: 600, marginBottom: '24px', fontStyle: 'italic', opacity: 0.9 }}>
          "{quote}"
       </div>
       <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--primary)' }}></div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '14px' }}>{author}</div>
            <div style={{ fontSize: '12px', opacity: 0.5 }}>{role}</div>
          </div>
       </div>
    </div>
  );
}

function MarqueeRow({ items }) {
  const repeated = [...items, ...items, ...items];
  return (
    <div style={{ display: 'flex', animation: 'marquee 40s linear infinite' }}>
      {repeated.map((item, i) => (
        <span key={i} style={{ fontSize: '24px', fontWeight: 800, margin: '0 40px', opacity: 0.6 }}>
          {item}
        </span>
      ))}
    </div>
  );
}

function FooterCol({ title, links }) {
  return (
    <div>
       <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '24px', letterSpacing: '1px' }}>{title.toUpperCase()}</h4>
       <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {links.map(l => (
            <Link key={l.name} to={l.href} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>{l.name}</Link>
          ))}
       </div>
    </div>
  );
}
