"use client";

import { useEffect, useState } from "react";

type ProofData = {
  totalBirdeyeCalls: number;
  uniqueEndpoints: number;
  tokensAnalyzed: number;
  caseFilesGenerated: number;
  generatedAt: string;
  storageMode: "supabase" | "memory";
};

export default function LiveMetricStrip() {
  const [data, setData] = useState<ProofData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function fetchProof() {
      try {
        const res = await fetch("/api/proof", { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch proof");
        const json = await res.json();
        if (mounted) {
          setData(json);
          setError(false);
        }
      } catch {
        if (mounted) {
          setError(true);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchProof();
    const interval = setInterval(fetchProof, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const metrics = [
    { label: "BIRDEYE CALLS", value: data?.totalBirdeyeCalls ?? 0 },
    { label: "ENDPOINTS HIT", value: data?.uniqueEndpoints ?? 0 },
    { label: "TOKENS ANALYZED", value: data?.tokensAnalyzed ?? 0 },
    { label: "CASE FILES", value: data?.caseFilesGenerated ?? 0 },
  ];

  return (
    <section className="bg-ldna-grid border-b border-ldna-grid">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px">
          {metrics.map((metric, i) => (
            <div key={i} className="p-8 text-center bg-ldna-panel/90 backdrop-blur-md hover:bg-ldna-panel transition-colors relative">
              <div className="text-3xl md:text-4xl font-mono font-bold text-ldna-text mb-3">
                {loading && !data ? "..." : error && !data ? "0" : metric.value}
              </div>
              <div className="text-xs uppercase tracking-widest text-ldna-muted font-bold">{metric.label}</div>
            </div>
          ))}
        </div>
        <div className="border-t border-ldna-grid bg-ldna-panel/70 px-4 py-3 text-center text-[11px] font-mono uppercase tracking-widest text-ldna-muted">
          {data?.storageMode === "supabase"
            ? "Progress stored in Supabase."
            : "Memory proof mode. Add Supabase env vars for durable progress."}
        </div>
      </div>
    </section>
  );
}
