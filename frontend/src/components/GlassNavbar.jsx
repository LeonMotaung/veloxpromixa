import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Menu, X, Sun, Moon } from 'lucide-react';

export default function GlassNavbar({ theme, toggleTheme }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!dropdownRef.current) return;
      if (!dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const menuItems = [
    { label: 'Home', to: '/' },
    { label: 'Use Cases', to: '/use-cases' },
    { label: 'Pricing', to: '/pricing' },
    { label: 'Docs', to: '/docs' },
    { label: 'Skills', to: '/skills' },
    { label: 'Dashboard', to: '/dashboard' },
    { label: 'Admin', to: '/admin' }
  ];

  const dropdownLinks = [
    { label: 'Model Registry', to: '/registry' },
    { label: 'Blueprint Library', to: '/blueprints' },
    { label: 'API Keys', to: '/keys' },
    { label: 'Status', to: '/status' },
  ];

  const showOverlay = dropdownOpen || (isMobile && navOpen);

  return (
    <>
      {showOverlay && (
        <div className="backdrop-blur-overlay" />
      )}

      <header className="glass-nav">
        <div className="glass-nav__inner">
          <div className="glass-nav__brand">
            <Link to="/" className="glass-nav__logo">
              <img
                src={theme === 'dark' ? '/images/onblack.png' : '/images/onwhite.png'}
                alt="Velox Logo"
              />
            </Link>
            <div>
              <div className="glass-nav__title">VELOX <span className="accent">PROXIMA</span></div>
              <div className="glass-nav__subtitle">Equilibrium AI Engine</div>
            </div>
          </div>

          {!isMobile && (
            <nav className="glass-nav__links">
              {menuItems.slice(0, 4).map(item => (
                <Link key={item.label} to={item.to} className="glass-nav__link">{item.label}</Link>
              ))}

              <div className="glass-nav__dropdown" ref={dropdownRef}>
                <button
                  className="glass-nav__link glass-nav__trigger"
                  onClick={() => setDropdownOpen(v => !v)}
                  aria-haspopup="true"
                  aria-expanded={dropdownOpen}
                >
                  More <ChevronDown size={16} />
                </button>
                {dropdownOpen && (
                  <div className="glass-dropdown glass-dropdown--desktop">
                    {dropdownLinks.map(link => (
                      <Link key={link.label} to={link.to} className="glass-dropdown__item">
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </nav>
          )}

          <div className="glass-nav__actions">
            <button className="glass-nav__icon" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link to="/dashboard" className="btn-primary glass-nav__cta">Launch</Link>
            <button
              className="glass-nav__icon glass-nav__burger"
              onClick={() => setNavOpen(v => !v)}
              aria-label="Toggle menu"
            >
              {navOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {isMobile && navOpen && (
          <div className="glass-mobile-menu">
            {menuItems.map(item => (
              <Link key={item.label} to={item.to} className="glass-mobile-menu__item" onClick={() => setNavOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="glass-mobile-menu__section">
              {dropdownLinks.map(link => (
                <Link key={link.label} to={link.to} className="glass-mobile-menu__item" onClick={() => setNavOpen(false)}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

