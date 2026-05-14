"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Activity, Clock, Loader2 } from "lucide-react";

export default function AnalyzePage() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleAnalyze = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!address.trim()) return;

    setIsAnalyzing(true);
    try {
      // We call the API here to trigger the "Analyzing..." state on the button
      // and ensure the address is valid/exists if possible.
      // Even if we don't use the result here, it warms up the cache/logs the attempt.
      await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: address.trim() }),
      });
      
      router.push(`/case/${address.trim()}`);
    } catch (err) {
      console.error(err);
      // Still push to the case page, it will handle the error UI properly
      router.push(`/case/${address.trim()}`);
    } finally {
      // We don't setIsAnalyzing(false) here because we are navigating away
    }
  };

  const [liveFeed, setLiveFeed] = useState<any[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      try {
        const res = await fetch("/api/new-listings");
        if (res.ok) {
          const result = await res.json();
          setLiveFeed(result.tokens);
        }
      } catch (err) {
        console.error("Failed to fetch feed:", err);
      } finally {
        setIsLoadingFeed(false);
      }
    }
    fetchFeed();
  }, []);

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
      <form onSubmit={handleAnalyze} className="bg-ldna-panel/80 backdrop-blur-md border border-ldna-grid p-8 md:p-10 mb-16 relative shadow-[0_0_40px_rgba(0,0,0,0.5)]">
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
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              disabled={isAnalyzing}
              className="w-full bg-ldna-bg border border-ldna-grid text-ldna-text px-12 py-4 font-mono focus:outline-none focus:border-ldna-accent focus:ring-1 focus:ring-ldna-accent/30 transition-all disabled:opacity-50"
            />
          </div>
          <button 
            type="submit"
            disabled={isAnalyzing || !address.trim()}
            className="bg-ldna-accent text-ldna-bg px-8 py-4 font-bold uppercase tracking-wider hover:bg-ldna-text hover:shadow-[0_0_20px_rgba(255,87,26,0.4)] transition-all whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-ldna-accent"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Generate Case File"
            )}
          </button>
        </div>
        <div className="mt-4 flex items-center gap-2 text-xs font-mono text-ldna-muted">
          <Activity className="w-3.5 h-3.5" />
          <span>Only evaluating tokens launched within the last 24 hours. Demonstration mode active.</span>
        </div>
      </form>

      {/* Live Feed Section */}
      <div>
        <div className="flex items-center justify-between mb-6 border-b border-ldna-grid pb-4">
          <h2 className="text-xl font-mono font-bold flex items-center gap-2">
            <Activity className="w-5 h-5 text-ldna-accent" />
            New Listings Feed
          </h2>
          <div className="flex items-center gap-2 text-xs font-mono text-ldna-text bg-ldna-panel px-3 py-1 border border-ldna-grid">
            <div className={`w-2 h-2 rounded-full ${isLoadingFeed ? 'bg-ldna-muted' : 'bg-green-500 animate-[pulse_2s_ease-in-out_infinite]'}`} />
            {isLoadingFeed ? 'SYNCING...' : 'LIVE // SYNCED'}
          </div>
        </div>

        <div className="grid gap-4 min-h-[400px]">
          {isLoadingFeed ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-ldna-panel/20 border border-ldna-grid animate-pulse" />
            ))
          ) : liveFeed.length > 0 ? (
            liveFeed.map((token, i) => (
              <Link 
                href={`/case/${token.address}`} 
                key={i}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-ldna-panel/40 border border-ldna-grid hover:border-ldna-accent/50 hover:bg-ldna-panel/80 transition-all duration-300 group"
              >
                <div className="flex items-center gap-6 mb-4 sm:mb-0">
                  <div className="w-12 h-12 bg-ldna-bg border border-ldna-grid flex items-center justify-center font-mono font-bold group-hover:border-ldna-accent/30 group-hover:text-ldna-accent transition-colors relative overflow-hidden text-sm">
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
                    {token.address.slice(0, 8)}...{token.address.slice(-8)}
                  </div>
                  <div className={`text-xs font-mono font-bold px-3 py-1.5 border ${
                    token.isDanger ? "bg-ldna-accent/10 border-ldna-accent/30 text-ldna-accent shadow-[0_0_10px_rgba(255,87,26,0.15)]" : 
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
            ))
          ) : (
            <div className="text-center py-20 border border-ldna-grid bg-ldna-panel/20 text-ldna-muted font-mono">
              NO RECENT LISTINGS DETECTED
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
