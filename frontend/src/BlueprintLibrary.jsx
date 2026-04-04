import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Terminal, 
  Code, 
  Cpu, 
  Layers, 
  Book, 
  Zap, 
  Sparkles,
  Command
} from 'lucide-react';
import GlassNavbar from './components/GlassNavbar';
import Footer from './components/Footer';
import blueprintsData from './data/blueprints.json';

const CategoryPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 20px',
      borderRadius: '20px',
      border: active ? '1px solid var(--primary)' : '1px solid var(--border)',
      background: active ? 'var(--primary-glow)' : 'var(--glass)',
      color: active ? 'var(--primary)' : 'var(--text-muted)',
      fontSize: '13px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap'
    }}
  >
    {label}
  </button>
);

export default function BlueprintLibrary() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

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

  const categories = ['All', ...new Set(blueprintsData.map(bp => bp.category))];

  const filteredBlueprints = useMemo(() => {
    return blueprintsData.filter(bp => {
      const matchesSearch = 
        bp.title.toLowerCase().includes(search.toLowerCase()) ||
        bp.desc.toLowerCase().includes(search.toLowerCase()) ||
        bp.category.toLowerCase().includes(search.toLowerCase());
      
      const matchesCategory = activeCategory === 'All' || bp.category === activeCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [search, activeCategory]);

  const getIcon = (category) => {
    switch(category.toLowerCase()) {
      case 'vision': return <Layers size={20} />;
      case 'nlp': return <Book size={20} />;
      case 'tabular': return <Cpu size={20} />;
      case 'unsupervised': return <Zap size={20} />;
      default: return <Sparkles size={20} />;
    }
  };

  return (
    <div style={{ position: 'relative', background: 'var(--background)', color: 'var(--text)', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlassNavbar theme={theme} toggleTheme={toggleTheme} />

      <main className="container" style={{ flex: 1, marginTop: '8vh', marginBottom: '8vh', padding: '0 24px' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: isMobile ? '36px' : '52px', fontWeight: 800, margin: '0 0 16px', letterSpacing: '-2px', background: 'linear-gradient(135deg, var(--text) 0%, var(--primary) 70%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Blueprint Marketplace
          </h1>
          <p style={{ fontSize: '18px', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto', lineHeight: 1.6 }}>
            Browse and deploy 500+ optimized VP blueprints. 
            Search, filter, and launch with one click.
          </p>
        </div>

        {/* Search and Filters */}
        <div style={{ maxWidth: '900px', margin: '0 auto 40px' }}>
          <div style={{ display: 'flex', position: 'relative', alignItems: 'center', marginBottom: '24px' }}>
            <Search size={22} style={{ position: 'absolute', left: '16px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search by model name, category, or task..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--glass)',
                border: '1px solid var(--border)',
                padding: '16px 16px 16px 48px',
                borderRadius: '16px',
                color: 'var(--text)',
                fontSize: '16px',
                outline: 'none',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            />
            <div style={{ position: 'absolute', right: '16px', display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: '4px', opacity: 0.5, fontSize: '12px' }}>
              <Command size={12} /> K
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px', scrollbarWidth: 'none' }}>
            {categories.map(cat => (
              <CategoryPill
                key={cat}
                label={cat}
                active={activeCategory === cat}
                onClick={() => setActiveCategory(cat)}
              />
            ))}
          </div>
        </div>

        {/* Results Grid */}
        {filteredBlueprints.length > 0 ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
            {filteredBlueprints.map(bp => (
              <div 
                key={bp.id} 
                className="glass-panel" 
                style={{ 
                  padding: '32px', 
                  borderRadius: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  height: '100%', 
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, right: 0, width: '100px', height: '100px', background: 'radial-gradient(circle at top right, var(--primary-glow), transparent)', opacity: 0.5 }} />
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{ width: '48px', height: '48px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    {getIcon(bp.category)}
                  </div>
                  <div style={{ fontSize: '11px', padding: '4px 10px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '6px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    {bp.difficulty.toUpperCase()}
                  </div>
                </div>

                <div style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--primary)', marginBottom: '8px' }}>{bp.category}</div>
                <h3 style={{ margin: '0 0 12px', fontSize: '22px', fontWeight: 800 }}>{bp.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, flex: 1, marginBottom: '24px' }}>{bp.desc}</p>
                
                <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                  <Link to="/dashboard" style={{ flex: 1, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--primary)', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 700, fontSize: '14px', transition: 'filter 0.2s' }}>
                    Deploy <Zap size={16} fill="white" />
                  </Link>
                  <button 
                    title="View DSL"
                    style={{ width: '48px', height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: '12px', cursor: 'pointer' }}
                  >
                    <Code size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '80px 0', opacity: 0.5 }}>
            <Search size={48} style={{ marginBottom: '16px' }} />
            <h3>No blueprints match your search</h3>
            <button onClick={() => {setSearch(''); setActiveCategory('All');}} style={{ color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginTop: '8px' }}>Clear all filters</button>
          </div>
        )}

        {/* Load More Mock */}
        {filteredBlueprints.length > 0 && (
          <div style={{ textAlign: 'center', marginTop: '60px' }}>
            <button className="btn-primary" style={{ padding: '14px 40px', background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--text)' }}>
              Load More Blueprints
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

