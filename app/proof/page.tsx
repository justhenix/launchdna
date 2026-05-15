import { Database, Server, Cpu, FileText, CheckCircle2, Activity } from "lucide-react";

import { getApiCallStats } from "@/lib/proof/apiCallLogger";

export const dynamic = "force-dynamic";

export default function ProofPage() {
  const proof = getApiCallStats();
  const minimumTargetReached = proof.totalCalls >= 50;

  const stats = [
    { label: "BIRDEYE API CALLS", value: proof.totalCalls.toLocaleString(), color: "text-ldna-text" },
    { label: "ENDPOINTS HIT", value: proof.endpointsIntegrated.length.toString(), color: "text-ldna-text" },
    { label: "LAUNCH TYPES", value: "3", color: "text-ldna-text" },
    { label: "QUALIFIER", value: minimumTargetReached ? "READY" : "NEED 50+", color: "text-ldna-text" },
  ];

  const callMessage =
    proof.totalCalls < 50
      ? "Analyze more real tokens before submission to pass the 50+ API call target."
      : "The 50+ Birdeye API call target has been reached for this session.";

  const endpoints = [
    { path: "/defi/v3/token/txs", purpose: "Identify early buy compression and trade pressure" },
    { path: "/defi/v3/token/holder", purpose: "Calculate top holder concentration" },
    { path: "/token/v1/holder-positions", purpose: "Enrich holder evidence and tags" },
    { path: "/defi/token_security", purpose: "Detect security or risk flags" },
    { path: "/defi/v3/ohlcv", purpose: "Replay price and volume movement" },
    { path: "/defi/token_overview", purpose: "Gather baseline token metadata and liquidity" },
  ];

  return (
    <div className="flex-1 flex flex-col container mx-auto px-4 py-12 max-w-5xl relative">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-ldna-accent/5 via-ldna-bg to-ldna-bg -z-10 mix-blend-screen" />

      <div className="mb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-serif mb-6 tracking-tight">Technical Architecture</h1>
        <p className="text-ldna-muted text-lg leading-relaxed">
          LaunchDNA is a forensic launch classifier for Solana tokens. 
          This page outlines our system architecture and data utilization strategy.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="max-w-4xl mx-auto w-full bg-ldna-grid border border-ldna-grid mb-16 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px">
          {stats.map((stat, i) => (
            <div key={i} className="bg-ldna-panel/80 p-8 text-center hover:bg-ldna-panel transition-colors flex flex-col items-center justify-center">
              <div className={`text-4xl font-mono font-bold mb-4 ${stat.color}`}>{stat.value}</div>
              <div className="text-xs font-mono text-ldna-muted uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Note about Snapshot Data */}
      <div className="bg-ldna-accent/10 border border-ldna-accent/30 p-6 md:p-8 mb-16 flex flex-col md:flex-row items-start gap-4 md:gap-6 relative overflow-hidden group hover:border-ldna-accent/50 transition-colors">
        <div className="absolute top-0 right-0 w-32 h-32 bg-ldna-accent/10 blur-3xl rounded-full" />
        <Activity className="w-6 h-6 text-ldna-accent shrink-0 mt-1 md:animate-pulse" />
        <div className="relative z-10">
          <h3 className="text-xl font-bold text-ldna-accent mb-3 flex items-center gap-3">
            Live Birdeye API Proof
          </h3>
          <p className="text-ldna-text/80 leading-relaxed text-sm md:text-base mb-3">
            LaunchDNA logs real Birdeye requests used during token analysis. These calls feed the LaunchCase classifier and produce forensic first-hour case files.
          </p>
          <div className="text-xs md:text-sm font-mono text-ldna-muted">
            {callMessage}
          </div>
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
