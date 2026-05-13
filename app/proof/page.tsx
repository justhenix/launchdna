import { Database, Server, Cpu, FileText, CheckCircle2 } from "lucide-react";

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
    <div className="flex-1 flex flex-col container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-16 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold text-ldna-accent border border-ldna-accent/30 bg-ldna-accent/10 rounded-full mb-6">
          Birdeye BIP Sprint 4 Submission
        </div>
        <h1 className="text-4xl md:text-5xl font-serif mb-6">Technical Architecture & Proof</h1>
        <p className="text-ldna-muted text-lg leading-relaxed">
          LaunchDNA is designed to fulfill the Birdeye BIP Sprint 4 competition requirements. 
          This page outlines our system architecture and API utilization strategy.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
        {stats.map((stat, i) => (
          <div key={i} className="bg-ldna-panel border border-ldna-grid p-6 text-center">
            <div className={`text-3xl font-mono font-bold mb-2 ${stat.color}`}>{stat.value}</div>
            <div className="text-xs font-mono text-ldna-muted uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Note about Mock Data */}
      <div className="bg-ldna-accent/10 border border-ldna-accent/30 p-6 mb-16 flex items-start gap-4">
        <CheckCircle2 className="w-6 h-6 text-ldna-accent shrink-0 mt-1" />
        <div>
          <h3 className="text-lg font-bold text-ldna-accent mb-2">Frontend Prototype Notice</h3>
          <p className="text-ldna-text/80 leading-relaxed text-sm">
            This deployment represents the frontend structural scaffold. All data currently displayed is 
            structured mock data using the stable <code className="bg-ldna-bg px-1 font-mono text-ldna-text">LaunchCase</code> contract. 
            The backend integration featuring live Birdeye API calls will replace this mock layer seamlessly.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-16 mb-16">
        {/* API Endpoints */}
        <div>
          <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
            <Database className="w-6 h-6 text-ldna-accent" />
            Birdeye Integration
          </h2>
          <div className="space-y-4">
            {endpoints.map((ep, i) => (
              <div key={i} className="bg-ldna-panel border border-ldna-grid p-4">
                <div className="font-mono text-sm font-bold text-ldna-text mb-2 bg-ldna-bg inline-block px-2 py-1 border border-ldna-grid">
                  {ep.path}
                </div>
                <div className="text-sm text-ldna-muted">{ep.purpose}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture Flow */}
        <div>
          <h2 className="text-2xl font-serif mb-6 flex items-center gap-3">
            <Server className="w-6 h-6 text-ldna-accent" />
            System Flow
          </h2>
          <div className="relative border-l-2 border-ldna-grid ml-4 space-y-10 py-4">
            {[
              { icon: Database, title: "Data Ingestion", desc: "Fetch new listing and request historical 1h data via Birdeye API." },
              { icon: Cpu, title: "Heuristic Classification", desc: "Evaluate metrics against threshold profiles (Sniper, Mirage, Organic)." },
              { icon: FileText, title: "Report Generation", desc: "Construct strict LaunchCase JSON object containing evidence and proof." },
              { icon: CheckCircle2, title: "Client Delivery", desc: "Serve forensic report to frontend interface." },
            ].map((step, i) => (
              <div key={i} className="relative pl-8">
                <div className="absolute -left-3.5 top-0 w-7 h-7 bg-ldna-panel border border-ldna-grid rounded-full flex items-center justify-center">
                  <step.icon className="w-3.5 h-3.5 text-ldna-accent" />
                </div>
                <div className="font-bold text-lg mb-1">{step.title}</div>
                <div className="text-sm text-ldna-muted">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
