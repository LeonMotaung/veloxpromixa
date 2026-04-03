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
  Moon,
  Menu,
  X
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

// Quick algorithm templates the user can drop into the training blueprint
const algorithmTemplates = [
  {
    key: 'logreg',
    name: 'Logistic Regression',
    description: 'Baseline classifier for linearly separable data.',
    template: (ds) => `# Logistic Regression baseline\nlayer Dense (INFER)\ntrain on ${ds}\nloss cross_entropy\noptimizer sgd lr=0.05\nbatch_size 32\nepochs 10\n`
  },
  {
    key: 'random_forest',
    name: 'Random Forest',
    description: 'Tree ensemble for tabular data.',
    template: (ds) => `# Random Forest\nmodel random_forest trees=200 max_depth=12\ntrain on ${ds}\nmetrics accuracy\n`
  },
  {
    key: 'xgboost',
    name: 'XGBoost',
    description: 'Boosted trees for structured data.',
    template: (ds) => `# XGBoost template\nmodel xgboost estimators=300 max_depth=8 lr=0.05\ntrain on ${ds}\nmetrics accuracy\n`
  },
  {
    key: 'cnn',
    name: 'CNN',
    description: '2D convolutional net for images.',
    template: (ds) => `# Small CNN\nlayer Conv2D (32, 3)\nlayer MaxPool2D (2)\nlayer Conv2D (64, 3)\nlayer MaxPool2D (2)\nlayer Dense (128)\nlayer Dense (INFER)\ntrain on ${ds}\nloss cross_entropy\noptimizer adam lr=0.001\nbatch_size 64\nepochs 8\n`
  },
  {
    key: 'transformer',
    name: 'Transformer',
    description: 'Sequence model for text/time-series.',
    template: (ds) => `# Tiny Transformer\nlayer Embedding (vocab=5000, dim=128)\nlayer TransformerEncoder (heads=4, depth=4, dim=128)\nlayer Dense (INFER)\ntrain on ${ds}\nloss cross_entropy\noptimizer adamw lr=0.0008\nbatch_size 32\nepochs 6\n`
  }
];

function App() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [navOpen, setNavOpen] = useState(false);
  const [trainModalOpen, setTrainModalOpen] = useState(false);

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
  const extractDataset = (text) => {
    const m = text.match(/train\s+on\s+([^\s]+)/i);
    return m ? m[1] : '';
  };
  const applyDatasetToSource = (text, ds) => {
    if (!ds) return text;
    if (/train\s+on\s+[^\n]+/i.test(text)) {
      return text.replace(/train\s+on\s+[^\n]+/i, `train on ${ds}`);
    }
    return `${text.trim()}\ntrain on ${ds}\n`;
  };

  const [jobId, setJobId] = useState(null);
  const [status, setStatus] = useState('idle');
  const [history, setHistory] = useState([]);
  const [runs, setRuns] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [predictionInput, setPredictionInput] = useState('');
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(extractDataset(source));
  const [selectedMeta, setSelectedMeta] = useState(null);
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatReply, setChatReply] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [useAlgorithms, setUseAlgorithms] = useState(true);
  const [selectedAlgorithms, setSelectedAlgorithms] = useState([]);
  const [hyperLoss, setHyperLoss] = useState('cross_entropy');
  const [hyperOpt, setHyperOpt] = useState('adam');
  const [hyperEpochs, setHyperEpochs] = useState(5);
  const [hyperBatch, setHyperBatch] = useState(32);

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
    if (!isMobile) setNavOpen(false);
  }, [isMobile]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const fetchRuns = async () => {
    try {
      const res = await axios.get('/api/runs');
      setRuns(res.data);
    } catch(e) {}
  };

  const fetchDatasets = async () => {
    try {
      const res = await axios.get('/api/datasets');
      setDatasets(res.data);
      const current = extractDataset(source);
      if (!selectedDataset && current) {
        setSelectedDataset(current);
      } else if (!selectedDataset && res.data.length) {
        setSelectedDataset(res.data[0].name);
        setSource((prev) => applyDatasetToSource(prev, res.data[0].name));
      }
    } catch(e) {}
  };

  useEffect(() => {
    fetchRuns();
  }, [status]);

  useEffect(() => {
    fetchDatasets();
  }, []);

  useEffect(() => {
    const meta = datasets.find(d => d.name === selectedDataset);
    setSelectedMeta(meta || null);
  }, [datasets, selectedDataset]);

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

  const upsertDirective = (text, key, value) => {
    const re = new RegExp(`${key}\\s+[^\\n]+`, 'i');
    if (re.test(text)) {
      return text.replace(re, `${key} ${value}`);
    }
    return `${text.trim()}\n${key} ${value}\n`;
  };

  const handleTrain = async () => {
    setStatus('training');
    setHistory([]);
    try {
      let srcWithDataset = applyDatasetToSource(source, selectedDataset);
      srcWithDataset = upsertDirective(srcWithDataset, 'loss', hyperLoss);
      srcWithDataset = upsertDirective(srcWithDataset, 'optimizer', hyperOpt);
      srcWithDataset = upsertDirective(srcWithDataset, 'epochs', hyperEpochs);
      srcWithDataset = upsertDirective(srcWithDataset, 'batch_size', hyperBatch);
      setSource(srcWithDataset);
      const res = await axios.post('/api/train', { source: srcWithDataset });
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

  const handleChat = async () => {
    if (!chatPrompt.trim()) return;
    setChatLoading(true);
    setChatReply("");
    try {
      const res = await axios.post('/api/chatgpt', {
        prompt: chatPrompt,
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 500
      });
      setChatReply(res.data.reply);
    } catch (e) {
      setChatReply("Error: " + (e.response?.data?.detail || e.message));
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: 'var(--background)', color: 'var(--text)', transition: 'background 0.4s' }}>
      {/* Sticky Navbar */}
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
              <div style={{ fontSize: '11px', opacity: 0.6, letterSpacing: '0.8px' }}>AI ENGINE · DASHBOARD</div>
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
              <button className="btn-primary" style={{ display: isMobile ? 'none' : 'flex', alignItems: 'center', gap: '8px' }} onClick={() => setTrainModalOpen(true)} disabled={status === 'training'}>
                {status === 'training' ? <RefreshCw className="spin" size={18} /> : <Play size={18} fill="currentColor" />}
                {status === 'training' ? 'TRAINING...' : 'RUN BLUEPRINT'}
              </button>
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

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: isMobile ? 'column' : 'row', overflow: 'hidden', minWidth: 0 }}>
        {/* Editor Sidebar */}
        <section style={{ width: isMobile ? '100%' : '420px', display: 'flex', flexDirection: 'column', borderRight: isMobile ? 'none' : '1px solid var(--border)', borderBottom: isMobile ? '1px solid var(--border)' : 'none', background: 'var(--background-alt)', minWidth: 0 }}>
          <div style={{ padding: isMobile ? '10px 14px' : '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', borderBottom: '1px solid var(--border)', opacity: 0.7 }}>
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
              padding: isMobile ? '14px' : '20px', 
              fontSize: isMobile ? '13px' : '14px', 
              fontFamily: '"Fira Code", monospace', 
              resize: 'none', 
              outline: 'none',
              lineHeight: '1.6',
              opacity: 0.9,
              minHeight: isMobile ? '260px' : 'auto'
            }}
          />
          
          {/* Run History List */}
          <div style={{ height: isMobile ? '240px' : '300px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column' }}>
             <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', background: 'var(--glass)', fontWeight: 600 }}>
                <History size={14} /> MODEL ZOO (PAST RUNS)
             </div>
             <div style={{ flex: 1, overflowY: 'auto' }}>
                {runs.map(run => (
                  <div key={run.job_id} onClick={() => { setSource(run.source); setJobId(run.job_id); setHistory(run.results.history); setSelectedDataset(extractDataset(run.source)); }} style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', cursor: 'pointer', fontSize: '13px' }}>
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
        <section style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px' : '32px', minWidth: 0 }}>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(320px, 1fr))', gap: isMobile ? '16px' : '24px', minWidth: 0 }}>
            
            {/* Live Metrics */}
            <div className="glass-panel" style={{ padding: isMobile ? '18px' : '24px', gridColumn: isMobile ? 'span 1' : 'span 2', minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <BarChart3 size={20} color="var(--primary)" />
                  <span style={{ fontWeight: 600 }}>Training Convergence</span>
                </div>
                <div style={{ fontSize: '12px', opacity: 0.5 }}>ACTIVE JOB: {jobId || 'NONE'}</div>
              </div>

              <div style={{ height: isMobile ? '220px' : '300px', width: '100%' }}>
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
            <div className="glass-panel" style={{ padding: isMobile ? '18px' : '24px', minWidth: 0 }}>
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
                      setSelectedDataset(file.name);
                      setSource((prev) => applyDatasetToSource(prev, file.name));
                      fetchDatasets();
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

              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ fontSize: '12px', opacity: 0.6 }}>Select dataset</div>
                <select
                  value={selectedDataset}
                  onChange={(e) => { setSelectedDataset(e.target.value); setSource((prev) => applyDatasetToSource(prev, e.target.value)); }}
                  style={{ background: 'var(--background-alt)', border: '1px solid var(--border)', padding: '10px', borderRadius: '8px', color: 'var(--text)' }}
                >
                  <option value="" disabled>Select uploaded CSV</option>
                  {datasets.map(ds => (
                    <option key={ds.name} value={ds.name}>
                      {ds.name} {ds.target_type ? `(${ds.target_type}${ds.num_classes ? `, k=${ds.num_classes}` : ''})` : ''}
                    </option>
                  ))}
                </select>
                <button
                  className="btn-primary"
                  style={{ marginTop: '8px' }}
                  disabled={!selectedDataset}
                  onClick={() => {
                    const isCls = selectedMeta && selectedMeta.target_type === 'classification' && (selectedMeta.num_classes || 0) > 1;
                    const numClasses = selectedMeta?.num_classes || 2;
                    const tpl = isCls
                      ? `layer Dense (INFER)\nlayer Dense (${numClasses})\ntrain on ${selectedDataset || 'data.csv'}\nloss cross_entropy\nepochs 5\nbatch_size 16\n`
                      : `layer Dense (INFER)\nlayer Dense (1)\ntrain on ${selectedDataset || 'data.csv'}\nloss mse\nepochs 1\nbatch_size 4\n`;
                    setSource(tpl);
                  }}
                >
                  Use dataset-aware template
                </button>
              </div>
            </div>

            {/* Prediction UI */}
            <div className="glass-panel" style={{ padding: isMobile ? '18px' : '24px', minWidth: 0 }}>
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

            {/* Foundational Proxy · ChatGPT */}
            <div className="glass-panel" style={{ padding: isMobile ? '18px' : '24px', minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Layers size={20} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>Foundational Proxy · ChatGPT</span>
              </div>
              <textarea
                value={chatPrompt}
                onChange={(e) => setChatPrompt(e.target.value)}
                placeholder="Ask ChatGPT via VP proxy..."
                style={{ width: '100%', minHeight: '120px', background: 'transparent', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px' }}
              />
              <button className="btn-primary" style={{ marginTop: '10px', width: '100%' }} onClick={handleChat} disabled={chatLoading}>
                {chatLoading ? 'Sending...' : 'Send to ChatGPT'}
              </button>
              {chatReply && (
                <div style={{ marginTop: '12px', padding: '12px', background: 'var(--glass)', border: '1px solid var(--border)', borderRadius: '10px', whiteSpace: 'pre-wrap' }}>
                  {chatReply}
                </div>
              )}
            </div>

            {/* Algorithm Library toggle */}
            <div 
              className="glass-panel" 
              style={{ 
                padding: isMobile ? '12px 14px' : '12px 16px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                gap: '12px',
                width: '100%',
                maxWidth: isMobile ? '100%' : '540px',
                alignSelf: 'flex-start'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={18} color="var(--primary)" />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 700, fontSize: '14px' }}>Use ML Algorithms</span>
                  <span style={{ fontSize: '12px', opacity: 0.65 }}>Show the supervised / unsupervised / deep learning playbook</span>
                </div>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input
                  type="checkbox"
                  checked={useAlgorithms}
                  onChange={(e) => setUseAlgorithms(e.target.checked)}
                  style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                />
                <span style={{ fontWeight: 600 }}>{useAlgorithms ? 'Enabled' : 'Disabled'}</span>
              </label>
            </div>

            {/* Algorithm Library */}
            {useAlgorithms && (
              <div className="glass-panel" style={{ padding: isMobile ? '18px' : '24px', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <Layers size={20} color="var(--primary)" />
                  <span style={{ fontWeight: 600 }}>Algorithm Library</span>
                  <span style={{ fontSize: '12px', opacity: 0.65 }}>Pick one or more; apply a template to the editor.</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {algorithmTemplates.map((alg) => {
                    const checked = selectedAlgorithms.includes(alg.key);
                    return (
                      <div key={alg.key} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '14px', background: checked ? 'var(--primary-glow)' : 'var(--glass)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{alg.name}</div>
                            <div style={{ fontSize: '12px', opacity: 0.7 }}>{alg.description}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => {
                              setSelectedAlgorithms((prev) =>
                                prev.includes(alg.key)
                                  ? prev.filter((k) => k !== alg.key)
                                  : [...prev, alg.key]
                              );
                            }}
                            style={{ width: 18, height: 18, accentColor: 'var(--primary)' }}
                          />
                        </div>
                        <button
                          className="btn-primary"
                          onClick={() => {
                            const tpl = alg.template(selectedDataset || 'data.csv');
                            setSource(tpl);
                          }}
                          style={{ width: '100%', background: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border)' }}
                        >
                          Apply Template
                        </button>
                      </div>
                    );
                  })}
                </div>

                {selectedAlgorithms.length > 0 && (
                  <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button
                      className="btn-primary"
                      onClick={() => {
                        // Merge all selected templates into one blueprint
                        const merged = selectedAlgorithms
                          .map((key) => {
                            const alg = algorithmTemplates.find((a) => a.key === key);
                            return alg ? alg.template(selectedDataset || 'data.csv') : '';
                          })
                          .join('\n');
                        setSource(merged);
                      }}
                    >
                      Apply Selected Templates
                    </button>
                    <button
                      className="btn-primary"
                      style={{ background: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border)' }}
                      onClick={() => setSelectedAlgorithms([])}
                    >
                      Clear Selection
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hardware Resources */}
            <div className="glass-panel" style={{ padding: isMobile ? '18px' : '24px', minWidth: 0 }}>
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

      {/* Train Configuration Modal */}
      {trainModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(12,46,112,0.78)', backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', zIndex: 40 }}>
          <div style={{ background: 'var(--background)', color: 'var(--text)', borderRadius: '18px', border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.35)', width: 'min(960px, 100%)', maxHeight: '90vh', overflow: 'auto', padding: isMobile ? '18px' : '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 800 }}>Configure Training Run</div>
                <div style={{ fontSize: '12px', opacity: 0.7 }}>Pick algorithms, optimizer, and loss before launching.</div>
              </div>
              <button onClick={() => setTrainModalOpen(false)} style={{ background: 'var(--glass)', border: '1px solid var(--border)', color: 'var(--text)', width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '12px', opacity: 0.65 }}>Dataset</label>
                <select
                  value={selectedDataset || ''}
                  onChange={(e) => setSelectedDataset(e.target.value)}
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--text)' }}
                >
                  {datasets.map((d) => (
                    <option key={d.name} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '12px', opacity: 0.65 }}>Loss Function</label>
                <select
                  value={hyperLoss}
                  onChange={(e) => setHyperLoss(e.target.value)}
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--text)' }}
                >
                  <option value="cross_entropy">cross_entropy</option>
                  <option value="mse">mse</option>
                  <option value="mae">mae</option>
                </select>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <label style={{ fontSize: '12px', opacity: 0.65 }}>Optimizer</label>
                <select
                  value={hyperOpt}
                  onChange={(e) => setHyperOpt(e.target.value)}
                  style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--text)' }}
                >
                  <option value="adam">adam</option>
                  <option value="adamw">adamw</option>
                  <option value="sgd">sgd</option>
                  <option value="rmsprop">rmsprop</option>
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '12px', opacity: 0.65 }}>Epochs</label>
                  <input type="number" min="1" max="200" value={hyperEpochs} onChange={(e) => setHyperEpochs(Number(e.target.value))} style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--text)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '12px', opacity: 0.65 }}>Batch Size</label>
                  <input type="number" min="1" max="2048" value={hyperBatch} onChange={(e) => setHyperBatch(Number(e.target.value))} style={{ padding: '12px', borderRadius: '10px', border: '1px solid var(--border)', background: 'var(--background-alt)', color: 'var(--text)' }} />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '6px' }}>
              <div style={{ fontWeight: 700, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--primary)" /> Choose Algorithms
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                {algorithmTemplates.map((alg) => {
                  const checked = selectedAlgorithms.includes(alg.key);
                  return (
                    <label key={alg.key} style={{ border: '1px solid var(--border)', borderRadius: '12px', padding: '12px', background: checked ? 'var(--primary-glow)' : 'var(--glass)', display: 'flex', gap: '10px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          setSelectedAlgorithms((prev) =>
                            prev.includes(alg.key) ? prev.filter((k) => k !== alg.key) : [...prev, alg.key]
                          );
                        }}
                        style={{ width: 18, height: 18, accentColor: 'var(--primary)', marginTop: '2px' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700 }}>{alg.name}</div>
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>{alg.description}</div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
              <button className="btn-primary" style={{ background: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border)' }} onClick={() => setTrainModalOpen(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={() => {
                  // apply first selected algorithm template if any
                  if (selectedAlgorithms.length > 0) {
                    const first = algorithmTemplates.find((a) => a.key === selectedAlgorithms[0]);
                    if (first) {
                      setSource(first.template(selectedDataset || 'data.csv'));
                    }
                  }
                  setTrainModalOpen(false);
                  handleTrain();
                }}
                disabled={status === 'training'}
              >
                {status === 'training' ? 'Training...' : 'Start Training'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Status Bar */}
      <footer style={{ padding: isMobile ? '8px 14px' : '8px 24px', borderTop: '1px solid var(--border)', background: 'var(--background-alt)', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '8px' : '0', justifyContent: 'space-between', fontSize: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
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
