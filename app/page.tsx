import Link from "next/link";
import { ArrowRight, ShieldAlert, Activity, Database, Cpu, Search, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Background Overlay for deeper contrast */}
      <div className="fixed inset-0 pointer-events-none bg-ldna-bg/50 -z-10 mix-blend-multiply" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden border-b border-ldna-grid">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-ldna-panel via-ldna-bg to-ldna-bg opacity-50"></div>
        
        {/* Abstract Motif Background Graphic */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl pointer-events-none opacity-20 -z-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 500 Q 300 200 500 400 T 900 300" stroke="#FF571A" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M100 400 Q 400 600 600 300 T 900 500" stroke="#FFE41A" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="5,5" />
          </svg>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono font-bold text-ldna-accent border border-ldna-accent/30 bg-ldna-accent/10 rounded-full mb-8 shadow-[0_0_15px_rgba(255,87,26,0.15)]">
              <span className="w-2 h-2 rounded-full bg-ldna-accent animate-pulse" />
              <span>Birdeye BIP Sprint 4</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight mb-8 leading-tight">
              Every Token Launch<br />
              <span className="text-ldna-muted">Leaves Evidence.</span>
            </h1>
            <p className="text-lg md:text-xl text-ldna-muted mb-12 max-w-2xl mx-auto leading-relaxed">
              LaunchDNA replays the first hour of new Solana tokens and classifies launch behavior using Birdeye market, trade, holder, security, and OHLCV data.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/analyze" className="w-full sm:w-auto px-8 py-4 bg-ldna-accent text-ldna-bg font-bold uppercase tracking-wider hover:bg-ldna-text hover:shadow-[0_0_20px_rgba(255,87,26,0.4)] transition-all duration-300 flex items-center justify-center gap-2 group">
                Analyze Token <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/case/7jQq...44b" className="w-full sm:w-auto px-8 py-4 border border-ldna-grid hover:border-ldna-text bg-ldna-panel/50 backdrop-blur-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2">
                View Case Files <ShieldAlert className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Metric Strip */}
      <section className="bg-ldna-grid border-b border-ldna-grid">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px">
            {[
              { label: "Birdeye Calls Logged", value: "127" },
              { label: "Endpoints Mapped", value: "8" },
              { label: "Launch Archetypes", value: "3" },
              { label: "First-Hour Replay", value: "Live" },
            ].map((metric, i) => (
              <div key={i} className="p-8 text-center bg-ldna-panel/90 backdrop-blur-md hover:bg-ldna-panel transition-colors">
                <div className="text-3xl md:text-4xl font-mono font-bold text-ldna-text mb-3">{metric.value}</div>
                <div className="text-xs uppercase tracking-widest text-ldna-muted font-bold">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Comparison */}
      <section className="py-24 border-b border-ldna-grid bg-ldna-bg">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-px bg-ldna-grid border border-ldna-grid shadow-2xl">
            {/* Left */}
            <div className="bg-ldna-panel/40 p-10 md:p-16">
              <div className="text-ldna-muted font-mono text-sm mb-8 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Traditional Radars
              </div>
              <ul className="space-y-6">
                {[
                  "Price change",
                  "Volume metrics",
                  "Generic risk scores",
                  "Trending token lists"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-ldna-muted">
                    <div className="mt-2 w-1.5 h-1.5 rounded-full bg-ldna-muted/50 shrink-0" />
                    <span className="text-lg line-through opacity-70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Right */}
            <div className="bg-ldna-panel p-10 md:p-16 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-ldna-accent/5 blur-[100px] group-hover:bg-ldna-accent/10 transition-colors duration-1000" />
              <div className="text-ldna-accent font-mono text-sm font-bold mb-8 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> LaunchDNA Forensics
              </div>
              <ul className="space-y-6 relative z-10">
                {[
                  "First-hour launch replay",
                  "Early sniper wallet discovery",
                  "Suspicious liquidity patterns",
                  "Evidence-backed classification"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-ldna-text font-medium">
                    <CheckCircle2 className="w-6 h-6 text-ldna-accent shrink-0 mt-0.5" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Case File Preview */}
      <section className="py-24 border-b border-ldna-grid bg-[radial-gradient(ellipse_at_bottom,var(--tw-gradient-stops))] from-ldna-panel/80 to-ldna-bg">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-12 gap-4">
            <h2 className="text-3xl font-serif">Case File Preview</h2>
            <Link href="/case/7jQq...44b" className="text-sm font-mono text-ldna-accent hover:text-ldna-text transition-colors flex items-center gap-2 uppercase tracking-wider">
              Open Full Report <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="border border-ldna-grid bg-ldna-bg/80 backdrop-blur-sm p-8 md:p-10 relative group cursor-pointer hover:border-ldna-accent/40 hover:shadow-[0_0_30px_rgba(255,87,26,0.05)] transition-all duration-500">
            <div className="absolute top-0 right-0 p-3 border-b border-l border-ldna-grid font-mono text-xs text-ldna-muted group-hover:bg-ldna-panel group-hover:text-ldna-accent transition-colors flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-ldna-accent rounded-full animate-pulse" />
              CLASSIFIED // LDNA-842
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start mb-10 mt-2">
              <div className="w-20 h-20 bg-ldna-panel border border-ldna-grid flex items-center justify-center text-ldna-muted font-mono font-bold text-2xl shrink-0 group-hover:border-ldna-accent/50 transition-colors">
                DOGE
              </div>
              <div>
                <h3 className="text-3xl font-bold mb-3 tracking-tight">DOGE2</h3>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1.5 text-xs font-mono font-bold bg-ldna-accent/10 text-ldna-accent border border-ldna-accent/30">
                    Sniper Swarm
                  </span>
                  <span className="px-3 py-1.5 text-xs font-mono bg-ldna-panel border border-ldna-grid text-ldna-text">
                    Confidence: 84%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
              {[
                { label: "Early Buy Compression", text: "61% of buys in first 3 mins", color: "text-ldna-warning", metric: "HIGH" },
                { label: "Top 10 Concentration", text: "42% controlled by top wallets", color: "text-ldna-warning", metric: "42%" },
                { label: "Sell Pressure", text: "Appeared after first spike", color: "text-ldna-accent", metric: "EVIDENT" },
                { label: "Security Flags", text: "Suspicious contract logic", color: "text-ldna-accent", metric: "FLAGGED" },
              ].map((evidence, i) => (
                <div key={i} className="p-5 bg-ldna-panel/40 border border-ldna-grid/50 hover:bg-ldna-panel/80 transition-colors flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-2">
                    <div className={`text-xs font-mono font-bold uppercase ${evidence.color}`}>{evidence.label}</div>
                    <div className="text-[10px] font-mono bg-ldna-bg px-1.5 py-0.5 border border-ldna-grid">{evidence.metric}</div>
                  </div>
                  <div className="text-sm text-ldna-muted">{evidence.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section className="py-24 bg-ldna-bg">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif mb-4">Forensic Architecture</h2>
            <p className="text-ldna-muted max-w-2xl mx-auto">How we turn chaos into classified intelligence using Birdeye.</p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-6 max-w-6xl mx-auto">
            {[
              { icon: Activity, title: "New Listings", desc: "Monitor Solana" },
              { icon: Database, title: "Birdeye API", desc: "Fetch Raw Data" },
              { icon: Search, title: "Snapshot Store", desc: "First Hour Replay" },
              { icon: Cpu, title: "Classifier Engine", desc: "Score & Tag" },
              { icon: ShieldAlert, title: "Case File", desc: "Generate Report" }
            ].map((step, i, arr) => (
              <div key={i} className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6 w-full lg:w-auto">
                <div className="w-full lg:w-44 p-6 bg-ldna-panel border border-ldna-grid text-center relative z-10 hover:border-ldna-accent/40 hover:-translate-y-1 transition-all duration-300">
                  <step.icon className="w-7 h-7 text-ldna-muted mb-4 mx-auto" />
                  <div className="font-mono text-sm font-bold text-ldna-text mb-2">{step.title}</div>
                  <div className="text-xs text-ldna-muted">{step.desc}</div>
                </div>
                {i < arr.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-ldna-grid hidden lg:block" />
                )}
                {i < arr.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-ldna-grid block lg:hidden rotate-90 my-1" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
