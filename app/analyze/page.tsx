import Link from "next/link";
import { Search, Activity, Clock } from "lucide-react";

export default function AnalyzePage() {
  const liveFeed = [
    { symbol: "PEPE", age: "2m", volume: "$1.2M", archetype: "Evaluating...", address: "7jQq9R8a...44b" },
    { symbol: "DOGE2", age: "12m", volume: "$5.4M", archetype: "Sniper Swarm", address: "G5vX1b8Y...9Xp", isDanger: true },
    { symbol: "CAT", age: "45m", volume: "$400K", archetype: "Organic Grind", address: "3xRq8P2b...1kM", isSafe: true },
    { symbol: "MOON", age: "58m", volume: "$2.1M", archetype: "Liquidity Mirage", address: "9aTq1V5n...2zL", isDanger: true },
  ];

  return (
    <div className="flex-1 flex flex-col container mx-auto px-4 py-12 max-w-5xl relative">
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-ldna-accent/5 via-ldna-bg to-ldna-bg -z-10 mix-blend-screen" />

      <div className="mb-12">
        <h1 className="text-4xl font-serif mb-4 flex items-center gap-3">
          Forensic Analyzer
          <span className="inline-block w-2.5 h-2.5 bg-ldna-accent animate-pulse rounded-full" />
        </h1>
        <p className="text-ldna-muted text-lg">Input a Solana token address to generate a comprehensive launch classification report.</p>
      </div>

      {/* Input Section */}
      <div className="bg-ldna-panel/80 backdrop-blur-md border border-ldna-grid p-8 md:p-10 mb-16 relative shadow-[0_0_40px_rgba(0,0,0,0.5)]">
        <div className="absolute -top-3 left-8 bg-ldna-bg px-3 py-0.5 font-mono text-xs text-ldna-accent uppercase font-bold tracking-wider border border-ldna-grid flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-ldna-accent rounded-full" />
          Query Target
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ldna-muted group-focus-within:text-ldna-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Enter Solana Token Address..." 
              className="w-full bg-ldna-bg border border-ldna-grid text-ldna-text px-12 py-4 font-mono focus:outline-none focus:border-ldna-accent focus:ring-1 focus:ring-ldna-accent/30 transition-all"
            />
          </div>
          <button className="bg-ldna-accent text-ldna-bg px-8 py-4 font-bold uppercase tracking-wider hover:bg-ldna-text hover:shadow-[0_0_20px_rgba(255,87,26,0.4)] transition-all whitespace-nowrap">
            Generate Case File
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-ldna-muted">
          <Activity className="w-3.5 h-3.5" />
          <span>Only evaluating tokens launched within the last 24 hours. Demonstration mode active.</span>
        </div>
      </div>

      {/* Live Feed Section */}
      <div>
        <div className="flex items-center justify-between mb-6 border-b border-ldna-grid pb-4">
          <h2 className="text-xl font-mono font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-ldna-accent" />
            New Listings Feed
          </h2>
          <div className="flex items-center gap-2 text-xs font-mono text-ldna-text bg-ldna-panel px-3 py-1 border border-ldna-grid">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-[pulse_2s_ease-in-out_infinite]" />
            LIVE // SYNCED
          </div>
        </div>

        <div className="grid gap-4">
          {liveFeed.map((token, i) => (
            <Link 
              href={`/case/${token.address}`} 
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-ldna-panel/40 border border-ldna-grid hover:border-ldna-accent/50 hover:bg-ldna-panel/80 transition-all duration-300 group"
            >
              <div className="flex items-center gap-6 mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-ldna-bg border border-ldna-grid flex items-center justify-center font-mono font-bold group-hover:border-ldna-accent/30 group-hover:text-ldna-accent transition-colors relative overflow-hidden">
                  <div className="absolute inset-0 bg-ldna-accent/5 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10">{token.symbol.slice(0,3)}</span>
                </div>
                <div>
                  <div className="font-bold text-lg mb-1">{token.symbol}</div>
                  <div className="flex items-center gap-4 text-xs font-mono text-ldna-muted">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {token.age} old</span>
                    <span className="text-ldna-text/70">Vol: {token.volume}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 border-ldna-grid pt-4 sm:pt-0">
                <div className="text-xs font-mono text-ldna-muted hidden md:block">
                  {token.address}
                </div>
                <div className={`text-xs font-mono font-bold px-3 py-1.5 border ${
                  token.isDanger ? "bg-ldna-accent/10 border-ldna-accent/30 text-ldna-accent shadow-[0_0_10px_rgba(255,87,26,0.1)]" : 
                  token.isSafe ? "bg-green-500/10 border-green-500/30 text-green-500" : 
                  "bg-ldna-bg border-ldna-grid text-ldna-muted"
                }`}>
                  {token.archetype}
                </div>
                <div className="text-ldna-muted group-hover:text-ldna-accent transition-colors p-2 bg-ldna-bg border border-ldna-grid group-hover:border-ldna-accent/30">
                  <Search className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
