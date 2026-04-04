import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown } from 'lucide-react';

export default function PremiumDocNavbar({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(window.innerWidth < 900);
  const dropdownRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const onResize = () => setMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const onClick = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const navLinks = [
    { label: 'Home', to: '/' },
    { label: 'Docs', to: '/docs' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Use Cases', to: '/use-cases' },
  ];

  const dropdownGroups = [
    {
      title: 'Docs',
      links: [
        { label: 'Getting Started', to: '/docs' },
        { label: 'Blueprint DSL', to: '/docs/DSL_GUIDE' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'API Reference', to: '/docs/API' },
        { label: 'Changelog', to: '/docs/CHANGELOG' },
      ],
    },
  ];

  const activePath = location.pathname;

  const overlay = open || (mobile && open);

  return (
    <>
      {overlay && <div className="pdn-overlay" />}

      <header className={`pdn-navbar ${overlay ? 'pdn-navbar--suppressed' : ''}`}>
        <div className="pdn-nav-inner">
          <div className="pdn-brand">
            <Link to="/" className="pdn-logo">
              <img src={theme === 'dark' ? '/images/onblack.png' : '/images/onwhite.png'} alt="Velox" />
            </Link>
            <div className="pdn-title">VELOX <span className="pdn-accent">DOCS</span></div>
          </div>

          {!mobile && (
            <nav className="pdn-links">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  className={`pdn-link ${activePath === link.to ? 'pdn-link--active' : ''}`}
                >
                  {link.label}
                </Link>
              ))}
              <div ref={dropdownRef} className="pdn-dropdown">
                <button className="pdn-link pdn-trigger" onClick={() => setOpen(!open)} aria-expanded={open}>
                  More <ChevronDown size={16} />
                </button>
                {open && (
                  <div className="pdn-dropdown-panel">
                    {dropdownGroups.map((group) => (
                      <div key={group.title} className="pdn-dropdown-col">
                        <div className="pdn-dropdown-title">{group.title}</div>
                        {group.links.map((l) => (
                          <Link key={l.label} to={l.to} className="pdn-dropdown-item" onClick={() => setOpen(false)}>
                            {l.label}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          )}

          <div className="pdn-actions">
            <button className="pdn-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
            <Link to="/dashboard" className="pdn-cta">Launch</Link>
            <button className="pdn-burger" onClick={() => setOpen(!open)} aria-label="Menu">
              {open ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>

      {mobile && open && (
        <div className="pdn-mobile" onClick={() => setOpen(false)}>
          <div className="pdn-mobile-panel" onClick={(e) => e.stopPropagation()}>
            {[...navLinks, ...dropdownGroups.flatMap(g => g.links)].map((l) => (
              <Link key={l.label} to={l.to} className="pdn-mobile-item" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

