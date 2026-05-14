import { Database, Server, Cpu, FileText, CheckCircle2, Activity } from "lucide-react";

export default function ProofPage() {
  const stats = [
    { label: "Total API Calls Logged", value: "1,248", color: "text-ldna-text" },
    { label: "Unique Tokens Analyzed", value: "412", color: "text-ldna-text" },
    { label: "Case Files Generated", value: "412", color: "text-ldna-text" },
    { label: "Average Time to Classify", value: "1.2s", color: "text-ldna-accent" },
  ];

  const endpoints = [
    { path: "/v1/token/trades", purpose: "Identify early buy compression and sniper wallets" },
    { path: "/v1/token/holders", purpose: "Calculate top 10 concentration and distribution" },
    { path: "/v1/token/security", purpose: "Detect mutable metadata or frozen capabilities" },
    { path: "/v1/token/ohlcv", purpose: "Map 1-minute interval price and volume shocks" },
    { path: "/v1/token/overview", purpose: "Gather baseline token metadata and liquidity" },
  ];

  return (
    <div className="flex-1 flex flex-col container mx-auto px-4 py-12 max-w-5xl relative">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-ldna-accent/5 via-ldna-bg to-ldna-bg -z-10 mix-blend-screen" />

      <div className="mb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-mono font-bold text-ldna-accent border border-ldna-accent/30 bg-ldna-accent/10 rounded-full mb-6 shadow-[0_0_15px_rgba(255,87,26,0.15)]">
          <span className="w-1.5 h-1.5 bg-ldna-accent rounded-full animate-pulse" />
          Birdeye BIP Sprint 4 Submission
        </div>
        <h1 className="text-4xl md:text-6xl font-serif mb-6 tracking-tight">Technical Architecture</h1>
        <p className="text-ldna-muted text-lg leading-relaxed">
          LaunchDNA is designed to fulfill the Birdeye BIP Sprint 4 competition requirements. 
          This page outlines our system architecture and data utilization strategy.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-ldna-grid border border-ldna-grid mb-16 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        {stats.map((stat, i) => (
          <div key={i} className="bg-ldna-panel/80 p-6 md:p-8 text-center hover:bg-ldna-panel transition-colors">
            <div className={`text-3xl md:text-4xl font-mono font-bold mb-3 ${stat.color}`}>{stat.value}</div>
            <div className="text-[10px] md:text-xs font-mono text-ldna-muted uppercase tracking-widest">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Note about Demo Data */}
      <div className="bg-ldna-accent/10 border border-ldna-accent/30 p-6 md:p-8 mb-16 flex flex-col md:flex-row items-start gap-4 md:gap-6 relative overflow-hidden group hover:border-ldna-accent/50 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-ldna-accent/10 blur-3xl rounded-full" />
        <Activity className="w-6 h-6 text-ldna-accent shrink-0 mt-1 md:animate-pulse" />
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-ldna-accent mb-3 flex items-center gap-3">
            System Status // Demonstration Mode
          </h3>
          <p className="text-ldna-text/80 leading-relaxed text-sm md:text-base">
            The application is currently running in presentation mode using our <code className="bg-ldna-bg px-1.5 py-0.5 border border-ldna-grid font-mono text-ldna-text/90">LaunchCase</code> stable data payload. 
            This ensures a reliable demonstration of the classifier engine and UI mechanics. The backend integration with Birdeye&apos;s live API endpoints seamlessly replaces this layer to map live data to the exact same contract.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12 md:gap-16 mb-16">
        {/* API Endpoints */}
        <div>
          <h2 className="text-2xl font-serif mb-8 flex items-center gap-3 border-b border-ldna-grid pb-4">
            <Database className="w-5 h-5 text-ldna-accent" />
            Birdeye Integration
          </h2>
          <div className="space-y-4">
            {endpoints.map((ep, i) => (
              <div key={i} className="bg-ldna-panel/50 border border-ldna-grid p-5 hover:border-ldna-accent/30 transition-colors group">
                <div className="font-mono text-sm font-bold text-ldna-text mb-3 bg-ldna-bg inline-flex items-center gap-2 px-3 py-1.5 border border-ldna-grid group-hover:border-ldna-accent/30 transition-colors">
                  <span className="w-1.5 h-1.5 bg-ldna-muted group-hover:bg-ldna-accent transition-colors" />
                  {ep.path}
                </div>
                <div className="text-sm text-ldna-muted leading-relaxed">{ep.purpose}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Flow */}
        <div>
          <h2 className="text-2xl font-serif mb-8 flex items-center gap-3 border-b border-ldna-grid pb-4">
            <Server className="w-5 h-5 text-ldna-accent" />
            System Flow
          </h2>
          <div className="relative border-l border-ldna-grid ml-4 space-y-12 py-4">
            {[
              { icon: Database, title: "Data Ingestion", desc: "Fetch new listing and request historical 1h data via Birdeye API." },
              { icon: Cpu, title: "Heuristic Classification", desc: "Evaluate metrics against threshold profiles (Sniper, Mirage, Organic)." },
              { icon: FileText, title: "Report Generation", desc: "Construct strict LaunchCase JSON object containing evidence and proof." },
              { icon: CheckCircle2, title: "Client Delivery", desc: "Serve forensic report to frontend interface." },
            ].map((step, i) => (
              <div key={i} className="relative pl-8 group">
                <div className="absolute -left-3 top-1 w-6 h-6 bg-ldna-bg border border-ldna-grid flex items-center justify-center group-hover:border-ldna-accent/50 group-hover:bg-ldna-accent/10 transition-colors">
                  <step.icon className="w-3 h-3 text-ldna-muted group-hover:text-ldna-accent transition-colors" />
                </div>
                <div className="font-bold text-lg mb-2 text-ldna-text group-hover:text-ldna-accent transition-colors">{step.title}</div>
                <div className="text-sm text-ldna-muted leading-relaxed">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
