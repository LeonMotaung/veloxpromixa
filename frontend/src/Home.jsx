import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Zap, Sparkles, Shield, Cpu, ArrowRight, Terminal, Layers, Activity, Check, Code, Server, FastForward } from 'lucide-react';
import GlassNavbar from './components/GlassNavbar';
import Footer from './components/Footer';

const features = [
  { icon: <Zap size={24} />, title: 'Equilibrium Scheduler', desc: 'Balances cost, latency, and thermal load across local + cloud automatically.' },
  { icon: <Sparkles size={24} />, title: 'One-Command Deploy', desc: 'Train a Blueprint, get an endpoint + cURL instantly—no MLOps glue.' },
  { icon: <Shield size={24} />, title: 'Guardrails & Observability', desc: 'Cost caps, jailbreak sweeps, live loss/latency dashboards out of the box.' },
  { icon: <Cpu size={24} />, title: 'One-Binary Edge', desc: 'Compile to native binaries for Metal/CUDA/ROCm—zero Python runtime.' },
];

export default function Home() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [codeTab, setCodeTab] = useState('train');

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

  return (
    <div style={{ position: 'relative', background: 'var(--background)', color: 'var(--text)' }}>
      <GlassNavbar theme={theme} toggleTheme={toggleTheme} />

      <main>
        {/* Hero */}
        <section className="container" style={{ marginTop: '8vh', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.05fr 0.95fr', gap: '32px', alignItems: 'center' }}>
          <div>
            <div className="btn-primary" style={{ display: 'inline-flex', padding: '8px 16px', borderRadius: '40px', fontSize: '12px', marginBottom: '16px', letterSpacing: '1px', opacity: 0.9 }}>
              {theme === 'dark' ? 'NIGHT MODE ACTIVE' : 'DAY MODE READY'}
            </div>
            <h1 style={{ fontSize: isMobile ? '46px' : '64px', fontWeight: 800, margin: 0, letterSpacing: '-2px', lineHeight: 1.05 }}>
              Velox Proxima.<br /> Deploy AI without the ops tax.
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginTop: '18px', maxWidth: '620px', lineHeight: 1.6 }}>
              Train, route, and deploy from one Blueprint. Equilibrium keeps GPUs cool, bills low, and latency tight—whether you’re on laptop, cluster, or edge.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '22px' }}>
              <Link to="/dashboard" className="btn-primary" style={{ padding: '14px 28px', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
                Launch Dashboard <ChevronRight size={18} />
              </Link>
              <Link to="/docs" style={{ textDecoration: 'none', border: '1px solid var(--border)', padding: '12px 18px', borderRadius: '12px', color: 'var(--text)', background: 'var(--glass)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                View DSL Docs
              </Link>
            </div>
          </div>

          {/* Hero visual */}
          <div className="glass-panel" style={{ padding: isMobile ? '14px' : '18px', borderRadius: '20px', backdropFilter: 'blur(16px)', boxShadow: '0 30px 70px rgba(0,0,0,0.35)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 0 6px rgba(34,197,94,0.18)' }}></span>
              <span style={{ fontFamily: 'Fira Code, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>Equilibrium Console</span>
            </div>
            <div className="glass-panel" style={{ padding: '12px', marginBottom: '10px', borderRadius: '14px' }}>
              <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '12px', color: 'var(--text)' }}>
                grid &#123; encoder: local, decoder: gpu0 &#125;<br />
                cost_ceiling = $0.08/run<br />
                thermal_guard = on<br />
                route chat =&gt; local | ChatGPT proxy (guardrails)
              </div>
            </div>
            <div className="glass-panel" style={{ padding: '12px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '12px', color: 'var(--text)' }}>layer Conv2D (32, 3)</div>
              <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '12px', color: 'var(--text)' }}>layer Dense (INFER)</div>
              <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '12px', color: 'var(--text)' }}>train on sample_iris.csv</div>
              <div style={{ fontFamily: 'Fira Code, monospace', fontSize: '12px', color: 'var(--text)' }}>optimizer adamw lr=0.0008</div>
              <div style={{ marginTop: '6px', display: 'flex', gap: '8px' }}>
                <span className="btn-primary" style={{ padding: '8px 12px', fontSize: '12px' }}>Run</span>
                <span className="btn-primary" style={{ padding: '8px 12px', fontSize: '12px', background: 'var(--background)', color: 'var(--text)', border: '1px solid var(--border)' }}>Deploy</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="container" style={{ marginTop: '14vh' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{ fontSize: '14px', letterSpacing: '2px', fontWeight: 700, opacity: 0.6 }}>WHY VELOX</div>
            <h2 style={{ fontSize: isMobile ? '26px' : '32px', fontWeight: 800, margin: '6px 0 0' }}>Speed, control, and lower GPU bills.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {features.map((f) => (
              <div key={f.title} className="glass-panel" style={{ padding: '14px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--glass)', display: 'grid', placeItems: 'center', color: 'var(--primary)' }}>
                  {f.icon}
                </div>
                <div style={{ fontWeight: 700 }}>{f.title}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. How It Works */}
        <section className="container" style={{ marginTop: '16vh' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '14px', letterSpacing: '2px', fontWeight: 700, opacity: 0.6 }}>THE PIPELINE</div>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 800, margin: '8px 0 0' }}>How It Works</h2>
          </div>
          <div style={{ display: isMobile ? 'flex' : 'grid', flexDirection: 'column', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', position: 'relative' }}>
            {[
              { id: 1, title: 'Define Blueprint', text: 'Write your 10-line DSL configuration.' },
              { id: 2, title: 'Train & Route', text: 'Equilibrium engine optimizes the compute.' },
              { id: 3, title: 'Deploy Instantly', text: 'Instant robust REST API endpoints.' },
              { id: 4, title: 'Monitor & Optimize', text: 'Live cost, loss, and latency tracking.' }
            ].map(step => (
              <div key={step.id} className="glass-panel" style={{ padding: '24px', borderRadius: '16px', position: 'relative', zIndex: 2 }}>
                 <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', marginBottom: '16px' }}>{step.id}</div>
                 <h3 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>{step.title}</h3>
                 <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Code Example (Tabs) */}
        <section className="container" style={{ marginTop: '16vh' }}>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '32px', alignItems: 'center' }}>
             <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 800, margin: '0 0 16px 0' }}>Developer Trust. Built In.</h2>
                <p style={{ fontSize: '16px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '24px' }}>
                  A declarative syntax that strips away 90% of structural MLOps boilerplate without hiding the mathematical realities. 
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                   {['train', 'deploy', 'monitor'].map(t => (
                     <button key={t} onClick={() => setCodeTab(t)} style={{ background: codeTab === t ? 'var(--primary)' : 'var(--glass)', color: codeTab === t ? '#fff' : 'var(--text)', border: '1px solid var(--border)', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, textTransform: 'capitalize' }}>
                       {t} Mode
                     </button>
                   ))}
                </div>
             </div>
             <div style={{ flex: 1.2, width: '100%' }}>
                <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: 'var(--background-alt)' }}>
                   <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ef4444' }} />
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#eab308' }} />
                      <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#22c55e' }} />
                   </div>
                   <pre style={{ margin: 0, fontSize: '13px', fontFamily: '"Fira Code", monospace', color: 'var(--text)', overflowX: 'auto' }}>
                     {codeTab === 'train' && (
`# Velox Proxima Blueprint - Vision
layer Conv2D (64, 3)
layer MaxPool2D (2)
layer BatchNorm ()
layer Dense (INFER)
layer Dense (10)

train on "s3://datasets/vision/batch"
optimizer adamw lr=0.0003
epochs 10`
                     )}
                     {codeTab === 'deploy' && (
`# Equilibrium Serving Request
grid {
  inference_node: edge_cuda_0
  fallback: cloud_h100
  thermal_throttle: true
}

curl -X POST https://api.velox.local/v1/predict/model_x \\
  -H "Authorization: Bearer $VELOX_KEY" \\
  -d '{"inputs": [0.33, 0.45, 0.9]}'

>> {"class": 2, "confidence": 0.998}`
                     )}
                     {codeTab === 'monitor' && (
`# Live Telemetry Stream
[VP-CORE] Process PID 18230 -> GPU 0 
[VP-CORE] Thermal Stable: 62°C (VRAM: 8.2GB)
[EXPECTED] Batch latency ~ 4.2ms
[ALERT] Loss spikes detected at step 3402
[ACTION] Auto-adjusting learning rate schedule...`
                     )}
                   </pre>
                </div>
             </div>
          </div>
        </section>

        {/* 5. Use Cases */}
        <section className="container" style={{ marginTop: '16vh' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 800, margin: '0' }}>Built for scale. Applied everywhere.</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
             {[
               { title: 'AI Startups', prob: 'Problem: Too much time building glue code.', sol: 'Solution: 10-line prototypes into prod APIs.' },
               { title: 'Enterprises', prob: 'Problem: Skyrocketing unscheduled GPU costs.', sol: 'Solution: Thermal + hardware cost routing.' },
               { title: 'Edge Devices', prob: 'Problem: Python runtimes are huge.', sol: 'Solution: Native binary compilation.' },
               { title: 'Indie Hackers', prob: "Problem: Can't manage Kubernetes.", sol: 'Solution: Zero config, 1-click deployments.' }
             ].map(uc => (
               <div key={uc.title} className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
                 <Layers size={24} color="var(--primary)" style={{ marginBottom: '16px' }} />
                 <h3 style={{ fontSize: '18px', margin: '0 0 12px 0' }}>{uc.title}</h3>
                 <div style={{ fontSize: '13px', opacity: 0.7, marginBottom: '8px' }}>{uc.prob}</div>
                 <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: 600 }}>{uc.sol}</div>
               </div>
             ))}
          </div>
        </section>

        {/* 6. Metrics / Performance */}
        <section className="container" style={{ marginTop: '16vh' }}>
           <div className="glass-panel" style={{ padding: isMobile ? '32px 20px' : '60px', borderRadius: '24px', background: 'linear-gradient(135deg, rgba(168,85,247,0.1), rgba(0,0,0,0.5))', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '32px', justifyContent: 'space-around' }}>
                 <div>
                    <h2 style={{ fontSize: '48px', fontWeight: 900, margin: 0, color: 'var(--primary)' }}>↓42%</h2>
                    <p style={{ margin: '8px 0 0 0', opacity: 0.7, fontWeight: 700, letterSpacing: '1px' }}>GPU OVERHEAD COST</p>
                 </div>
                 <div>
                    <h2 style={{ fontSize: '48px', fontWeight: 900, margin: 0, color: '#22c55e' }}>↑3x</h2>
                    <p style={{ margin: '8px 0 0 0', opacity: 0.7, fontWeight: 700, letterSpacing: '1px' }}>DEPLOYMENT SPEED</p>
                 </div>
                 <div>
                    <h2 style={{ fontSize: '48px', fontWeight: 900, margin: 0, color: '#eab308' }}>{"<"}120<span style={{ fontSize: '24px' }}>ms</span></h2>
                    <p style={{ margin: '8px 0 0 0', opacity: 0.7, fontWeight: 700, letterSpacing: '1px' }}>LATENCY ROUTING</p>
                 </div>
              </div>
           </div>
        </section>

        {/* 7. Architecture / System Diagram Section */}
        <section className="container" style={{ marginTop: '16vh' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 800, margin: '0' }}>System Architecture</h2>
          </div>
          <div className="glass-panel" style={{ padding: '40px', borderRadius: '16px', display: 'flex', flexDirection: isMobile ? 'column' : 'row', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '16px', background: 'var(--glass)', borderRadius: '12px', border: '1px solid var(--primary)' }}>
                <Terminal size={32} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>User Config</div>
            </div>
            
            {isMobile ? <ArrowRight style={{ transform: 'rotate(90deg)' }} color="var(--primary)" /> : <ArrowRight color="var(--primary)" />}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '16px', background: 'var(--glass)', borderRadius: '12px' }}>
                <Layers size={32} />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Blueprint Engine</div>
            </div>

            {isMobile ? <ArrowRight style={{ transform: 'rotate(90deg)' }} color="var(--primary)" /> : <ArrowRight color="var(--primary)" />}

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{ padding: '16px', background: 'var(--primary-glow)', borderRadius: '12px', color: 'var(--primary)' }}>
                <img
                  src={theme === 'light' ? '/images/onwhite.png' : '/images/onblack.png'}
                  alt="Velox Logo"
                  style={{ width: 32, height: 32, objectFit: 'contain' }}
                />
              </div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Equilibrium Scheduler</div>
            </div>

            {isMobile ? <ArrowRight style={{ transform: 'rotate(90deg)' }} color="var(--primary)" /> : <ArrowRight color="var(--primary)" />}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--glass)', borderRadius: '12px' }}>
                <Server size={20} /> <span style={{ fontSize: '12px' }}>GPU / Cloud API</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'var(--glass)', borderRadius: '12px' }}>
                <Cpu size={20} /> <span style={{ fontSize: '12px' }}>Native Edge Binary</span>
              </div>
            </div>

          </div>
        </section>

        {/* 8. Comparison Section */}
        <section className="container" style={{ marginTop: '16vh' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2 style={{ fontSize: isMobile ? '28px' : '36px', fontWeight: 800, margin: '0' }}>Compare the Stack</h2>
          </div>
          <div className="table-wrap glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
               <thead>
                  <tr style={{ background: 'var(--background-alt)' }}>
                     <th style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 600, opacity: 0.6 }}>Capability</th>
                     <th style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 800, color: 'var(--primary)' }}>Velox Proxima</th>
                     <th style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 600, opacity: 0.6 }}>Traditional ML Ops</th>
                  </tr>
               </thead>
               <tbody>
                  <tr>
                     <td style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>Deploy Time</td>
                     <td style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>1 Command</td>
                     <td style={{ padding: '20px', borderBottom: '1px solid var(--border)', opacity: 0.8 }}>Manual Docker/API Glue</td>
                  </tr>
                  <tr>
                     <td style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>Cost Control</td>
                     <td style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>Built-in Ceiling</td>
                     <td style={{ padding: '20px', borderBottom: '1px solid var(--border)', opacity: 0.8 }}>External Monitoring</td>
                  </tr>
                  <tr>
                     <td style={{ padding: '20px', borderBottom: '1px solid var(--border)' }}>Hardware Routing</td>
                     <td style={{ padding: '20px', borderBottom: '1px solid var(--border)', fontWeight: 'bold' }}>Auto (Thermal Aware)</td>
                     <td style={{ padding: '20px', borderBottom: '1px solid var(--border)', opacity: 0.8 }}>Static Infrastructure</td>
                  </tr>
                  <tr>
                     <td style={{ padding: '20px' }}>Engine Boilerplate</td>
                     <td style={{ padding: '20px', fontWeight: 'bold' }}>0 Lines</td>
                     <td style={{ padding: '20px', opacity: 0.8 }}>100+ Lines PyTorch</td>
                  </tr>
               </tbody>
            </table>
          </div>
        </section>

        {/* 9. Testimonials */}
        <section className="container" style={{ marginTop: '16vh' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
             {[
                { quote: "Velox reduced our inference and training overhead by nearly 60%. It just handles the infrastructure silently.", name: "Sarah J.", role: "Lead AI Engineer" },
                { quote: "We went from messy PyTorch training scripts to 12-line Blueprints that instantly spool up robust APIs. Incredible DX.", name: "Mark T.", role: "CTO, FinTech Startup" },
                { quote: "The equilibrium scheduler saved our hardware. Managing thermal load while running heavy vision models automatically is a game changer.", name: "Dr. Liana K.", role: "Director of Edge AI" }
             ].map((t, i) => (
                <div key={i} className="glass-panel" style={{ padding: '32px', borderRadius: '16px' }}>
                   <div style={{ display: 'flex', gap: '4px', color: '#fbbf24', marginBottom: '16px' }}>
                      <Zap size={16} fill="currentColor" />
                      <Zap size={16} fill="currentColor" />
                      <Zap size={16} fill="currentColor" />
                   </div>
                   <p style={{ margin: '0 0 24px 0', fontSize: '15px', lineHeight: 1.6, opacity: 0.9 }}>"{t.quote}"</p>
                   <div style={{ fontWeight: 700, fontSize: '14px' }}>{t.name}</div>
                   <div style={{ fontSize: '12px', opacity: 0.6 }}>{t.role}</div>
                </div>
             ))}
          </div>
        </section>

        {/* 10. Final CTA Section */}
        <section className="container" style={{ marginTop: '16vh', marginBottom: '12vh' }}>
           <div className="glass-panel" style={{ padding: isMobile ? '40px 20px' : '80px', borderRadius: '24px', textAlign: 'center', background: 'linear-gradient(rgba(168,85,247,0.1), transparent)' }}>
             <h2 style={{ fontSize: isMobile ? '36px' : '52px', fontWeight: 900, margin: '0 0 16px 0', letterSpacing: '-1px' }}>Ready to stop fighting infrastructure?</h2>
             <p style={{ fontSize: '18px', color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px auto' }}>Join the next generation of AI development. Native edge binaries, automatic cost routing, zero API glue.</p>
             <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/dashboard" className="btn-primary" style={{ padding: '16px 32px', fontSize: '16px', borderRadius: '12px', textDecoration: 'none' }}>Launch Dashboard</Link>
                <Link to="/docs" style={{ padding: '16px 32px', fontSize: '16px', borderRadius: '12px', textDecoration: 'none', background: 'var(--background-alt)', color: 'var(--text)', border: '1px solid var(--border)' }}>View Documentation</Link>
             </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
