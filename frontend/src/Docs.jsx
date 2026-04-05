import React, { useState, useEffect } from 'react';
import api from './api';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, Terminal, Book, FileText, Activity, RefreshCw, Sun, Moon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import GlassNavbar from './components/GlassNavbar';

export default function Docs() {
  const { docName } = useParams();
  const [allDocs, setAllDocs] = useState({});
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    // Fetch all docs once on mount
    api.get('/api/docs/all')
      .then(res => {
        if (res.data && typeof res.data === 'object' && !res.data.error) {
          setAllDocs(res.data);
          setLoading(false);
        } else {
          setLoading(false);
          setAllDocs({ 'DSL_GUIDE': '# [ERROR] Failed to Sync Knowledge Engine.' });
        }
      })
      .catch(err => {
        console.error("Documentation fetch failed", err);
        setLoading(false);
        setAllDocs({ 'DSL_GUIDE': '# [ERROR] Network Connection Failure. Inference Engine Offline.' });
      });
  }, []);

  const currentDoc = docName || 'DSL_GUIDE';
  const content = allDocs[currentDoc] || '';

  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--text)', minHeight: '100vh', transition: 'all 0.4s' }}>
      <GlassNavbar theme={theme} toggleTheme={toggleTheme} />

      <div className="container" style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '260px 1fr', gap: isMobile ? '24px' : '48px', paddingTop: '32px', paddingBottom: '40px' }}>
          
          <aside>
             <h4 style={{ fontSize: '11px', opacity: 0.4, letterSpacing: '1px', marginBottom: '16px' }}>CORE GUIDES</h4>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/docs/DSL_GUIDE" className="glass-panel" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text)', fontSize: '14px' }}>
                   <Terminal size={16} color="var(--primary)" /> DSL Blueprinting
                </Link>
                <Link to="/docs/API_GUIDE" className="glass-panel" style={{ padding: '12px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'var(--text)', fontSize: '14px' }}>
                   <FileText size={16} color="var(--primary)" /> API & Integration
                </Link>
             </div>
          </aside>

          <main className="glass-panel" style={{ 
            padding: isMobile ? '28px' : '60px', 
            overflowY: 'auto', 
            marginBottom: '60px',
            background: 'var(--glass)',
            border: '1px solid var(--border)',
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0
          }}>
             {loading ? (
               <div style={{ opacity: 0.8, color: 'var(--text)', letterSpacing: '2px', fontWeight: 800, textAlign: 'center', marginTop: '100px' }}>
                  <RefreshCw className="spin" style={{ marginBottom: '16px', display: 'block', margin: '0 auto 16px' }} />
                  SYNCING ENGINE...
               </div>
             ) : (
                <div id="markdown-container" style={{ color: 'var(--text)' }}>
                   <ReactMarkdown>{content || '# Document Not Found'}</ReactMarkdown>
                </div>
             )}
          </main>
      </div>

      <style>{`
         #markdown-container h1 { font-size: 40px; letter-spacing: -2px; margin-bottom: 24px; border-bottom: 1px solid var(--border); padding-bottom: 12px; }
         #markdown-container h2 { font-size: 24px; margin-top: 40px; color: var(--primary); }
         #markdown-container p { line-height: 1.6; opacity: 0.8; font-size: 16px; }
         #markdown-container pre { background: var(--background-alt); padding: 24px; border-radius: 12px; border: 1px solid var(--border); font-family: 'Fira Code', monospace; overflow-x: auto; }
         #markdown-container code { font-family: 'Fira Code', monospace; color: var(--primary); background: var(--glass); padding: 2px 6px; border-radius: 4px; }
         #markdown-container table { width: 100%; border-collapse: collapse; margin: 32px 0; }
         #markdown-container th { text-align: left; opacity: 0.4; font-size: 11px; padding: 12px; border-bottom: 1px solid var(--border); }
         #markdown-container td { padding: 12px; border-bottom: 1px solid var(--border); font-size: 14px; }
         @media (max-width: 900px) {
           #markdown-container h1 { font-size: 30px; }
           #markdown-container h2 { font-size: 20px; }
         }
         .spin { animation: spin 2s linear infinite; }
         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
