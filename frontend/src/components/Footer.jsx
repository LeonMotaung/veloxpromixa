import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const FooterCol = ({ title, links }) => (
  <div>
    <h4 style={{ fontSize: '12px', fontWeight: 800, marginBottom: '24px', letterSpacing: '1px' }}>{title.toUpperCase()}</h4>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {links.map(l => (
        <Link key={l.name} to={l.href} style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '14px' }}>{l.name}</Link>
      ))}
    </div>
  </div>
);

export default function Footer() {
  return (
    <section style={{ marginTop: '15vh', borderTop: '1px solid var(--border)', padding: '100px 0 60px' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px' }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
            <img
              src={localStorage.getItem('theme') === 'light' ? '/images/onwhite.png' : '/images/onblack.png'}
              alt="Velox Logo"
              style={{ width: 28, height: 28, objectFit: 'contain' }}
            />
            <span style={{ fontWeight: 800, fontSize: '20px' }}>VELOX</span>
          </div>
          <p style={{ opacity: 0.5, fontSize: '14px', lineHeight: 1.6 }}>
            Built by Velox  AI with a soul. Independent project focused on privacy and performance.
            Not affiliated with Anthropic. Formerly known as Proxima.
          </p>
        </div>

        <FooterCol title="Community" links={[
          { name: 'Discord', href: '#' },
          { name: 'GitHub', href: '#' },
          { name: 'VeloxHub', href: '#' }
        ]} />

        <FooterCol title="Resources" links={[
          { name: 'Documentation', href: '/docs' },
          { name: 'Benchmarks', href: '#' },
          { name: 'Registry', href: '#' }
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
      <div className="container" style={{ marginTop: '80px', paddingTop: '40px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: 0.4, flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '24px', fontSize: '12px', fontWeight: 800 }}>
          <span>NVIDIA</span>
          <span>VERCEL</span>
          <span>CONVEX</span>
          <span>OPENAI</span>
        </div>
        <div style={{ fontSize: '11px' }}>Built by DeWet Technologies</div>
      </div>
    </section>
  );
}
