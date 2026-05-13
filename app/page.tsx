import Link from "next/link";
import { ArrowRight, ShieldAlert, Activity, Database, Cpu, Search, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden border-b border-ldna-grid">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,var(--tw-gradient-stops))] from-ldna-panel via-ldna-bg to-ldna-bg opacity-50"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold text-ldna-accent border border-ldna-accent/30 bg-ldna-accent/10 rounded-full mb-8">
              <span>{"//"}</span>
              <span>Birdeye BIP Sprint 4</span>
              <span>{"//"}</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-serif font-medium tracking-tight mb-8 leading-tight">
              Every Token Launch<br />
              <span className="text-ldna-muted">Leaves Evidence.</span>
            </h1>
            <p className="text-lg md:text-xl text-ldna-muted mb-12 max-w-2xl mx-auto leading-relaxed">
              LaunchDNA replays the first hour of new Solana tokens and classifies launch behavior using Birdeye market, trade, holder, security, and OHLCV data.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/analyze" className="w-full sm:w-auto px-8 py-4 bg-ldna-accent text-ldna-bg font-bold uppercase tracking-wider hover:bg-ldna-text transition-all duration-300 flex items-center justify-center gap-2">
                Analyze Token <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/case/mock-token" className="w-full sm:w-auto px-8 py-4 border border-ldna-grid hover:border-ldna-text bg-ldna-panel/50 backdrop-blur-sm font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2">
                View Case Files <ShieldAlert className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
        
        {/* Abstract Motif Background Graphic */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-6xl pointer-events-none opacity-20 -z-10">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dotGrid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle fill="#F4F4F4" cx="2" cy="2" r="1.5" opacity="0.3"></circle>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dotGrid)"></rect>
            <path d="M100 500 Q 300 200 500 400 T 900 300" stroke="#FF571A" strokeWidth="2" fill="none" opacity="0.5" />
            <path d="M100 400 Q 400 600 600 300 T 900 500" stroke="#FFE41A" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="5,5" />
          </svg>
        </div>
      </section>

      {/* Metric Strip */}
      <section className="border-b border-ldna-grid bg-ldna-panel/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-ldna-grid border-x border-ldna-grid">
            {[
              { label: "Birdeye API Calls Logged", value: "127" },
              { label: "Endpoints Mapped", value: "8" },
              { label: "Launch Archetypes", value: "3" },
              { label: "First-Hour Replay", value: "Live" },
            ].map((metric, i) => (
              <div key={i} className="p-6 text-center">
                <div className="text-3xl md:text-4xl font-mono font-bold text-ldna-text mb-2">{metric.value}</div>
                <div className="text-xs uppercase tracking-widest text-ldna-muted font-bold">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Comparison */}
      <section className="py-24 border-b border-ldna-grid">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-px bg-ldna-grid border border-ldna-grid">
            {/* Left */}
            <div className="bg-ldna-bg p-12">
              <div className="text-ldna-muted font-mono text-sm mb-6 flex items-center gap-2">
                <Activity className="w-4 h-4" /> Token radars show movement
              </div>
              <ul className="space-y-6">
                {[
                  "Price change",
                  "Volume",
                  "Generic risk score",
                  "What is pumping right now"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-ldna-muted">
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-ldna-muted/50 shrink-0" />
                    <span className="text-lg line-through opacity-70">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Right */}
            <div className="bg-ldna-panel p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-ldna-accent/5 blur-[100px]" />
              <div className="text-ldna-accent font-mono text-sm font-bold mb-6 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> LaunchDNA shows evidence
              </div>
              <ul className="space-y-6">
                {[
                  "What happened during launch",
                  "Who entered early",
                  "Whether liquidity behavior was suspicious",
                  "Why classification was made"
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-ldna-text font-medium">
                    <CheckCircle2 className="w-6 h-6 text-ldna-accent shrink-0" />
                    <span className="text-lg">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Case File Preview */}
      <section className="py-24 border-b border-ldna-grid bg-[radial-gradient(ellipse_at_bottom,var(--tw-gradient-stops))] from-ldna-panel/50 to-ldna-bg">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-serif">Case File Preview</h2>
            <Link href="/case/mock-token" className="text-sm font-mono text-ldna-accent hover:text-ldna-text transition-colors flex items-center gap-2 uppercase tracking-wider">
              Open Full Report <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="border border-ldna-grid bg-ldna-bg p-8 relative group cursor-pointer hover:border-ldna-accent/50 transition-colors">
            <div className="absolute top-0 right-0 p-4 border-b border-l border-ldna-grid font-mono text-xs text-ldna-muted group-hover:bg-ldna-panel transition-colors">
              CONFIDENTIAL // MOCK-111
            </div>
            
            <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
              <div className="w-16 h-16 bg-ldna-panel border border-ldna-grid flex items-center justify-center text-ldna-muted font-mono font-bold text-xl shrink-0">
                MCK
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">MOCK</h3>
                <div className="flex flex-wrap gap-3">
                  <span className="px-3 py-1 text-xs font-mono font-bold bg-ldna-accent/10 text-ldna-accent border border-ldna-accent/20">
                    Sniper Swarm
                  </span>
                  <span className="px-3 py-1 text-xs font-mono bg-ldna-panel border border-ldna-grid text-ldna-text">
                    Confidence: 84%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Early Buy Compression", text: "61% of buys in first 3 mins", color: "text-ldna-warning" },
                { label: "Top 10 Holder Concentration", text: "42% controlled by top wallets", color: "text-ldna-warning" },
                { label: "Sell Pressure", text: "Appeared after first spike", color: "text-ldna-accent" },
                { label: "Security Flags", text: "Detected suspicious contract logic", color: "text-ldna-accent" },
              ].map((evidence, i) => (
                <div key={i} className="p-4 bg-ldna-panel/50 border border-ldna-grid/50">
                  <div className={`text-xs font-mono font-bold uppercase mb-1 ${evidence.color}`}>{evidence.label}</div>
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
            <p className="text-ldna-muted max-w-2xl mx-auto">How we turn chaos into classified intelligence.</p>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-8 max-w-6xl mx-auto">
            {[
              { icon: Activity, title: "New Listings", desc: "Monitor Solana" },
              { icon: Database, title: "Birdeye API", desc: "Fetch Raw Data" },
              { icon: Search, title: "Snapshot Store", desc: "First Hour Replay" },
              { icon: Cpu, title: "Classifier Engine", desc: "Score & Tag" },
              { icon: ShieldAlert, title: "Forensic Case File", desc: "Generate Report" }
            ].map((step, i, arr) => (
              <div key={i} className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8 w-full lg:w-auto">
                <div className="w-full lg:w-48 p-6 bg-ldna-panel border border-ldna-grid text-center relative z-10 hover:border-ldna-accent/30 transition-colors">
                  <step.icon className="w-8 h-8 text-ldna-muted mb-4 mx-auto" />
                  <div className="font-mono text-sm font-bold text-ldna-text mb-2">{step.title}</div>
                  <div className="text-xs text-ldna-muted">{step.desc}</div>
                </div>
                {i < arr.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-ldna-grid hidden lg:block" />
                )}
                {i < arr.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-ldna-grid block lg:hidden rotate-90 my-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
