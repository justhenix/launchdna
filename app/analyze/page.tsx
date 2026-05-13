import Link from "next/link";
import { Search, Activity, Clock } from "lucide-react";

export default function AnalyzePage() {
  const mockFeed = [
    { symbol: "PEPE", age: "2m", volume: "$1.2M", archetype: "Evaluating...", address: "mock-pepe" },
    { symbol: "DOGE2", age: "12m", volume: "$5.4M", archetype: "Sniper Swarm", address: "mock-token", isDanger: true },
    { symbol: "CAT", age: "45m", volume: "$400K", archetype: "Organic Grind", address: "mock-cat", isSafe: true },
    { symbol: "MOON", age: "58m", volume: "$2.1M", archetype: "Liquidity Mirage", address: "mock-moon", isDanger: true },
  ];

  return (
    <div className="flex-1 flex flex-col container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-12">
        <h1 className="text-4xl font-serif mb-4">Forensic Analyzer</h1>
        <p className="text-ldna-muted text-lg">Input a Solana token address to generate a comprehensive launch classification report.</p>
      </div>

      {/* Input Section */}
      <div className="bg-ldna-panel border border-ldna-grid p-8 mb-16 relative">
        <div className="absolute -top-3 left-8 bg-ldna-bg px-2 font-mono text-xs text-ldna-accent uppercase font-bold tracking-wider">
          Query Target
        </div>
        
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ldna-muted" />
            <input 
              type="text" 
              placeholder="Enter Solana Token Address..." 
              className="w-full bg-ldna-bg border border-ldna-grid text-ldna-text px-12 py-4 font-mono focus:outline-none focus:border-ldna-accent transition-colors"
            />
          </div>
          <button className="bg-ldna-accent text-ldna-bg px-8 py-4 font-bold uppercase tracking-wider hover:bg-ldna-text transition-colors whitespace-nowrap">
            Generate Case File
          </button>
        </div>
        <p className="mt-4 text-xs font-mono text-ldna-muted">
          Only evaluating tokens launched within the last 24 hours. Mock data will be shown for demo purposes.
        </p>
      </div>

      {/* Live Feed Section */}
      <div>
        <div className="flex items-center justify-between mb-6 border-b border-ldna-grid pb-4">
          <h2 className="text-xl font-mono font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-ldna-accent" />
            New Listings Feed
          </h2>
          <div className="flex items-center gap-2 text-xs font-mono text-ldna-muted bg-ldna-panel px-3 py-1 border border-ldna-grid">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            LIVE
          </div>
        </div>

        <div className="grid gap-4">
          {mockFeed.map((token, i) => (
            <Link 
              href={`/case/${token.address}`} 
              key={i}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-ldna-bg border border-ldna-grid hover:border-ldna-accent/50 transition-colors group"
            >
              <div className="flex items-center gap-6 mb-4 sm:mb-0">
                <div className="w-12 h-12 bg-ldna-panel border border-ldna-grid flex items-center justify-center font-mono font-bold group-hover:bg-ldna-accent/10 group-hover:text-ldna-accent transition-colors">
                  {token.symbol.slice(0,3)}
                </div>
                <div>
                  <div className="font-bold text-lg mb-1">{token.symbol}</div>
                  <div className="flex items-center gap-4 text-xs font-mono text-ldna-muted">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {token.age} old</span>
                    <span>Vol: {token.volume}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 justify-between sm:justify-end border-t sm:border-t-0 border-ldna-grid pt-4 sm:pt-0">
                <div className={`text-xs font-mono font-bold px-3 py-1 border ${
                  token.isDanger ? "bg-ldna-accent/10 border-ldna-accent/30 text-ldna-accent" : 
                  token.isSafe ? "bg-green-500/10 border-green-500/30 text-green-500" : 
                  "bg-ldna-panel border-ldna-grid text-ldna-muted"
                }`}>
                  {token.archetype}
                </div>
                <div className="text-ldna-muted group-hover:text-ldna-text transition-colors">
                  <Search className="w-5 h-5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
