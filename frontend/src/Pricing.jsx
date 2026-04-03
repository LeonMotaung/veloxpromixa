import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
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
          <div style={{ fontSize: '11px', opacity: 0.6, letterSpacing: '0.8px' }}>AI ENGINE · PLATFORM</div>
        </div>
      </div>

      <nav style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
            {[
              {label:'Home', to:'/'},
              {label:'Use Cases', to:'/use-cases'},
              {label:'Pricing', to:'/pricing'},
              {label:'Blog', to:'#'},
              {label:'Skills', to:'/skills'},
              {label:'Resources', to:'#'}
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
            {navOpen ? '✕' : '☰'}
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
            {label:'Blog', to:'#'},
            {label:'Skills', to:'/skills'},
            {label:'Resources', to:'#'}
          ].map(item => (
            <Link key={item.label} to={item.to} style={{ padding: '10px 12px', borderRadius: '10px', textDecoration: 'none', color: 'var(--text)', background: 'var(--glass)', border: '1px solid var(--border)' }}>{item.label}</Link>
          ))}
          <Link to="/dashboard" className="btn-primary" style={{ width: '100%', textDecoration: 'none', justifyContent: 'center' }}>
            Launch Dashboard
          </Link>
        </div>
      </div>
    )}
  </header>
);

const plans = [
  {
    name: 'LITE',
    blurb: 'For personal projects and getting started',
    monthly: 29,
    yearly: 24,
    yearlyBill: '$288/year',
    save: 'Save $60/year vs monthly',
    features: [
      'Equilibrium scheduler (local)',
      'One-command Blueprint runs',
      'vp.API data streaming built-in',
      '2 vCPU • 4 GB RAM • 40 GB SSD',
      'Local + laptop GPU support',
      'Encrypted workspace containers',
      'Daily backups',
      'Community support',
      'Usage: CPU $0.002/min, A10 $0.02/min'
    ],
    cta: 'Subscribe to Lite'
  },
  {
    name: 'PRO',
    blurb: 'For power users who rely on AI daily',
    monthly: 89,
    yearly: 79,
    yearlyBill: '$948/year',
    save: 'Save $120/year vs monthly',
    features: [
      'Everything in Lite',
      'Foundational proxy routing (ChatGPT/local)',
      'Cost/latency guardrails on prompts',
      'Observability: loss/latency/thermal dashboards',
      'Priority GPU queue • 4 vCPU • 8 GB RAM • 80 GB SSD',
      'Autoscaling when load spikes',
      'SSO-ready, audit logs',
      'Email & priority support',
      'Usage: A10 $0.02/min, A100 $0.09/min'
    ],
    tag: 'Most Popular',
    cta: 'Subscribe to Pro'
  },
  {
    name: 'MAX',
    blurb: 'For heavy workloads and maximum performance',
    monthly: 179,
    yearly: 149,
    yearlyBill: '$1,788/year',
    save: 'Save $360/year vs monthly',
    features: [
      'Everything in Pro',
      'Grid-aware orchestration & auto-sharding',
      'One-binary mobile/edge builds (Metal/CUDA/ROCm)',
      'Dedicated GPU pools • 8 vCPU • 16 GB RAM • 160 GB SSD',
      'VPC / private cloud option',
      'Advanced guardrails & jailbreak sweeps',
      'Thermal + cost equilibrium policies',
      'Dedicated TAM & 24/7 support',
      'Usage: A100 $0.09/min, H100 $0.18/min'
    ],
    cta: 'Subscribe to Max'
  }
];

const faq = [
  { q: 'How does billing work?', a: 'Subscriptions renew automatically each period. Yearly plans bill once upfront.' },
  { q: 'Can I upgrade or downgrade my plan?', a: 'Yes. Changes prorate automatically at the start of the next billing cycle.' },
  { q: 'What payment methods do you accept?', a: 'Major credit/debit cards and invoices for annual Max customers.' },
  { q: 'What\'s your refund policy?', a: 'We offer a 14-day money-back guarantee on new subscriptions.' },
  { q: 'How is my data handled?', a: 'Each plan runs in isolated, encrypted containers with daily backups.' },
  { q: 'Is there a free trial?', a: 'Yes, a 7-day trial is available on Lite and Pro.' }
];

export default function Pricing() {
  const [billing, setBilling] = useState('yearly'); // yearly | monthly
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (!isMobile) setNavOpen(false);
  }, [isMobile]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <div style={{ color: 'var(--text)', background: 'var(--background)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Nav theme={theme} toggleTheme={toggleTheme} isMobile={isMobile} navOpen={navOpen} setNavOpen={setNavOpen} />
      {/* Hero */}
      <section className="container" style={{ padding: '48px 0 32px', textAlign: 'center' }}>
        <p style={{ fontSize: '13px', letterSpacing: '2px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>Simple, Transparent Pricing</p>
        <h1 style={{ fontSize: '32px', fontWeight: 800, margin: 0, color: 'var(--text)' }}>Choose the plan that fits your needs. Cancel anytime.</h1>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
          <div className="pricing-toggle glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px', borderRadius: '999px' }}>
            <button
              className="btn-primary"
              style={{ padding: '10px 18px', borderRadius: '999px', opacity: billing === 'yearly' ? 1 : 0.7, boxShadow: billing === 'yearly' ? '0 8px 24px rgba(168,85,247,0.35)' : 'none' }}
              onClick={() => setBilling('yearly')}
            >
              Yearly <span style={{ fontSize: '11px', padding: '2px 8px', marginLeft: '6px', borderRadius: '999px', background: '#fff', color: 'var(--primary)', fontWeight: 700 }}>Save 16%</span>
            </button>
            <button
              style={{ padding: '10px 18px', borderRadius: '999px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)', fontWeight: 600, cursor: 'pointer' }}
              onClick={() => setBilling('monthly')}
            >
              Monthly
            </button>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="container" style={{ padding: '0 0 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '12px', color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center' }}>
          <div>Every plan runs on its own secure, isolated container with encrypted access.</div>
        </div>
        <br></br>
        <div className="pricing-row">
          {plans.map((plan) => {
            const price = billing === 'yearly' ? plan.yearly : plan.monthly;
            const badge = plan.tag;
            return (
              <div key={plan.name} className="glass-panel pricing-card">
                {badge && (
                  <div className="badge-most">{badge}</div>
                )}
                <div style={{ height: '24px' }} />
                <span className="plan-name">{plan.name}</span>
                <p className="plan-blurb">{plan.blurb}</p>
                <div className="price-row">
                  <span className="price">${price}</span>
                  <span className="price-unit">/mo</span>
                </div>
                <p className="bill-note">{plan.yearlyBill}</p>
                <div className="plan-save">
                  <p className="save-text">{plan.save}</p>
                  <button className="btn-ghost-accent">{plan.cta}</button>
                </div>
                <ul className="plan-list">
                  {plan.features.map((feat) => (
                    <li key={feat} className="plan-item">
                      <span className="check">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {/* Comparison */}
      <section className="container" style={{ padding: '24px 0 32px' }}>
        <div className="table-wrap glass-panel" style={{ padding: '16px', borderRadius: '16px' }}>
          <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '12px' }}>Compare Plans</div>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '640px' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', fontSize: '13px' }}>
                <th style={{ padding: '10px' }}>Feature</th>
                <th style={{ padding: '10px' }}>Lite</th>
                <th style={{ padding: '10px' }}>Pro</th>
                <th style={{ padding: '10px' }}>Max</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: '14px' }}>
              {[
                ['Always-on uptime', '✓', '✓', '✓'],
                ['Auto-updates & maintenance', '✓', '✓', '✓'],
                ['Fully private & encrypted', '✓', '✓', '✓'],
                ['Daily backups', '✓', '✓', '✓'],
                ['Custom skills & integrations', '✓', '✓', '✓'],
                ['Priority support', '—', '✓', '✓'],
                ['vCPU cores', '2', '4', '8'],
                ['RAM', '4 GB', '8 GB', '16 GB'],
                ['SSD storage', '40 GB', '80 GB', '160 GB'],
              ].map((row) => (
                <tr key={row[0]} style={{ borderTop: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px', color: 'var(--text)' }}>{row[0]}</td>
                  <td style={{ padding: '10px' }}>{row[1]}</td>
                  <td style={{ padding: '10px' }}>{row[2]}</td>
                  <td style={{ padding: '10px' }}>{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="container" style={{ padding: '16px 0 48px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, textAlign: 'center', marginBottom: '12px' }}>Pricing FAQ</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '820px', margin: '0 auto' }}>
          {faq.map((item) => (
            <details key={item.q} style={{ background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '12px', padding: '12px 16px' }}>
              <summary style={{ cursor: 'pointer', listStyle: 'none', fontWeight: 600, color: 'var(--text)' }}>{item.q}</summary>
              <p style={{ marginTop: '8px', color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1.6 }}>{item.a}</p>
            </details>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
}
