import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { 
  Play, 
  Terminal, 
  BarChart3, 
  Cpu, 
  Save, 
  Database,
  Activity,
  ChevronRight,
  RefreshCw,
  Box,
  Layers,
  Search,
  History,
  FileCode,
  CheckCircle2,
  Sun,
  Moon
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

function App() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [source, setSource] = useState(`# Velox Proxima Blueprint - Transformer MNIST
layer Conv2D (32, 3)
layer MaxPool2D (2)
layer BatchNorm ()
layer Attention (8, ?)
layer Dense (10)

train on mnist
optimizer adam lr=0.001
epochs 5
batch_size 64
loss cross_entropy`);

  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [history, setHistory] = useState([]);
  const [runs, setRuns] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [predictionInput, setPredictionInput] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const fetchRuns = async () => {
    try {
      const res = await axios.get('/api/runs');
      setRuns(res.data);
    } catch(e) {}
  };

  useEffect(() => {
    fetchRuns();
  }, [status]);

  useEffect(() => {
    let interval;
    if (status === 'training' && jobId) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(`/api/train/${jobId}`);
          const data = res.data;
          
          if (data.status === 'completed') {
            setStatus('completed');
            setHistory(data.results.history || []);
            clearInterval(interval);
          } else if (data.status === 'failed') {
            setStatus('failed');
            clearInterval(interval);
          } else if (data.status === 'training' && data.results?.history) {
            setHistory(data.results.history);
          }
        } catch (e) {
          console.error("Status check failed", e);
        }
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [status, jobId]);

  const handleTrain = async () => {
    setStatus('training');
    setHistory([]);
    try {
      const res = await axios.post('/api/train', { source });
      setJobId(res.data.job_id);
    } catch (e) {
      setStatus('failed');
    }
  };

  const handlePredict = async () => {
    if (!jobId) return;
    try {
      const features = predictionInput.split(',').map(Number);
      const res = await axios.post(`/api/predict/${jobId}`, features);
      setPredictions(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--background)', color: 'var(--text)', transition: 'background 0.4s' }}>
      {/* Header */}
      <header style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/" className="glass-panel" style={{ padding: '8px', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <img 
               src={theme === 'dark' ? '/images/onblack.png' : '/images/onwhite.png'} 
               alt="Velox Logo" 
               style={{ width: '20px', height: '20px', objectFit: 'contain' }}
            />
          </Link>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }} className="neon-text">
              VELOX <span style={{ color: 'var(--primary)' }}>PROXIMA</span>
            </h1>
            <div style={{ fontSize: '11px', opacity: 0.5, letterSpacing: '1px' }}>AI ENGINE V0.2.1 • DASHBOARD READY</div>
          </div>
        </div>


        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button 
             onClick={toggleTheme}
             style={{ 
               background: 'var(--glass)', 
               border: '1px solid var(--border)', 
               color: 'var(--text)', 
               width: '36px', 
               height: '36px', 
               borderRadius: '50%',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               cursor: 'pointer'
             }}
          >
             {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleTrain} disabled={status === 'training'}>
            {status === 'training' ? <RefreshCw className="spin" size={18} /> : <Play size={18} fill="currentColor" />}
            {status === 'training' ? 'TRAINING...' : 'RUN BLUEPRINT'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Editor Sidebar */}
        <section style={{ width: '450px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', background: 'var(--background-alt)' }}>
          <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', borderBottom: '1px solid var(--border)', opacity: 0.7 }}>
            <Terminal size={14} /> BLUEPRINT CODE
          </div>
          <textarea 
            spellCheck="false"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            style={{ 
              flex: 1, 
              background: 'transparent', 
              color: 'var(--text)', 
              border: 'none', 
              padding: '20px', 
              fontSize: '14px', 
              fontFamily: '"Fira Code", monospace', 
              resize: 'none', 
              outline: 'none',
              lineHeight: '1.6',
              opacity: 0.8
            }}
          />
          
          {/* Run History List */}
          <div style={{ height: '300px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
             <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'var(--glass)', fontWeight: 600 }}>
                <History size={14} /> MODEL ZOO (PAST RUNS)
             </div>
             <div style={{ flex: 1, overflowY: 'auto' }}>
                {runs.map(run => (
                  <div key={run.job_id} onClick={() => { setSource(run.source); setJobId(run.job_id); setHistory(run.results.history); }} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{run.job_id}</span>
                      <span style={{ opacity: 0.5, fontSize: '10px' }}>{new Date(run.timestamp * 1000).toLocaleTimeString()}</span>
                    </div>
                    <div style={{ fontSize: '11px', opacity: 0.7 }}>
                       Acc: {run.results.test_accuracy? run.results.test_accuracy.toFixed(2) : 'N/A'}% • {run.source.split('\n').filter(l => l.startsWith('layer')).length} layers
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </section>

        {/* Dashboard Area */}
        <section style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            
            {/* Live Metrics */}
            <div className="glass-panel" style={{ padding: '24px', gridColumn: 'span 2' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={20} color="var(--primary)" />
                  <span style={{ fontWeight: 600 }}>Training Convergence</span>
                </div>
                <div style={{ fontSize: '12px', opacity: 0.5 }}>ACTIVE JOB: {jobId || 'NONE'}</div>
              </div>

              <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer>
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="epoch" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip contentStyle={{ background: 'var(--background)', border: '1px solid var(--border)', borderRadius: '8px', color: 'var(--text)' }} />
                    <Area type="monotone" dataKey="acc" stroke="var(--primary)" fillOpacity={1} fill="url(#colorAcc)" name="Accuracy (%)" />
                    <Line type="monotone" dataKey="loss" stroke="var(--accent)" dot={false} strokeWidth={2} name="Loss" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Custom Data Sieve */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Database size={20} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>Data Infrastructure</span>
              </div>
              <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>Upload datasets or weights. The engine auto-normalizes all inputs.</p>
              
              <div style={{ padding: '20px', border: '2px dashed var(--border)', borderRadius: '8px', textAlign: 'center' }}>
                <input 
                  type="file" 
                  id="csv-upload" 
                  accept="*" 
                  style={{ display: 'none' }} 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (!file) return;
                    const formData = new FormData();
                    formData.append('file', file);
                    try {
                      await axios.post('/api/upload', formData);
                      alert(`Vault Secured: data/${file.name}`);
                    } catch (err) {
                      alert("Upload failed.");
                    }
                  }}
                />
                <label htmlFor="csv-upload" style={{ cursor: 'pointer' }}>
                  <div style={{ color: 'var(--primary)', marginBottom: '8px' }}><RefreshCw size={24} /></div>
                  <div style={{ fontSize: '11px', fontWeight: 600 }}>SECURE UPLOAD</div>
                </label>
              </div>
            </div>

            {/* Prediction UI */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Search size={20} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>Production Inference</span>
              </div>
              <p style={{ fontSize: '12px', opacity: 0.6, marginBottom: '16px' }}>Test models from the Zoo immediately. Auto-loads weights as needed.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  placeholder="Paste features: 5.1, 3.5..." 
                  value={predictionInput}
                  onChange={(e) => setPredictionInput(e.target.value)}
                  style={{ background: 'var(--background-alt)', border: '1px solid var(--border)', padding: '12px', borderRadius: '8px', color: 'var(--text)' }}
                />
                <button className="btn-primary" onClick={handlePredict} disabled={!jobId}>INFER CLASS</button>
              </div>

              {predictions && (
                <div style={{ marginTop: '24px', padding: '16px', background: 'var(--primary-glow)', border: '1px solid var(--primary)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', textTransform: 'uppercase', marginBottom: '4px', opacity: 0.6 }}>Output Result ({predictions.source})</div>
                  <div style={{ fontSize: '22px', fontWeight: 800 }}>CLASS {predictions.prediction}</div>
                  <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <CheckCircle2 size={12} color="var(--primary)" /> Confidence Score: {Math.max(...predictions.raw_output[0]).toFixed(6)}
                  </div>
                </div>
              )}
            </div>

            {/* Hardware Resources */}
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Box size={20} />
                <span style={{ fontWeight: 600 }}>Infrastructure Sieve</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ opacity: 0.6 }}>Runtime Mode</span>
                  <span style={{ color: 'var(--primary)' }}>ASYNCHRONOUS POOL</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ opacity: 0.6 }}>Compiler</span>
                  <span style={{ color: 'var(--primary)' }}>GRAPH V2 (SYMBOLIC)</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ opacity: 0.6 }}>Registry Status</span>
                  <span style={{ color: 'var(--primary)' }}>CONNECTED • {runs.length} MODELS</span>
                </div>
              </div>
            </div>

          </div>
        </section>
      </main>

      {/* Footer Status Bar */}
      <footer style={{ padding: '8px 24px', borderTop: '1px solid var(--border)', background: 'var(--background-alt)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: status === 'training' ? '#f59e0b' : '#10b981' }}></div>
            {status.toUpperCase()}
          </div>
          <div style={{ opacity: 0.4 }}>|</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.7 }}>
            <Database size={12} /> GPU MEMORY: {status === 'training' ? '0.1 MB (AMP)' : '0.0 MB'}
          </div>
        </div>
        <div style={{ opacity: 0.5 }}>
          VELOX PROXIMA ENTERPRISE GRID • STABLE
        </div>
      </footer>

      <style>{`
        .spin { animation: spin 2s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: var(--primary); }
      `}</style>
    </div>
  );
}

export default App;
