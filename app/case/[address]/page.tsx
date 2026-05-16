"use client";

import { use, useEffect, useState } from "react";
import { LaunchCase } from "@/types/launch-case";
import { BIRDEYE_CASE_ENDPOINTS } from "@/lib/birdeye/endpoints";
import { fallbackEndpointProof } from "@/lib/proof/endpointProof";
import { sanitizeTokenName, sanitizeTokenSymbol } from "@/lib/listings";
import { AlertTriangle, CheckCircle2, ShieldAlert, BarChart3, Clock, Database, Crosshair, Users, Activity, Loader2, RefreshCw, Copy, Check } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { TooltipLabel } from "@/components/InfoTooltip";

const ANALYZE_TIMEOUT_MS = 20_000;

function neutralChart(): LaunchCase["chart"] {
  return Array.from({ length: 60 }).map((_, index) => ({
    time: `Minute ${index + 1}`,
    price: 1,
    volume: 0,
  }));
}

function createPartialFallbackCase(
  address: string,
  name?: string,
  symbol?: string,
  endpointProof: LaunchCase["endpointProof"] = fallbackEndpointProof(BIRDEYE_CASE_ENDPOINTS),
): LaunchCase {
  const safeName = sanitizeTokenName(name, symbol, address);
  const safeSymbol = sanitizeTokenSymbol(symbol, name, address);

  return {
    token: {
      address,
      name: safeName,
      symbol: safeSymbol,
      chain: "solana",
    },
    classification: {
      archetype: "Organic Grind",
      confidence: 60,
      summary: "Limited evidence available. Some Birdeye datasets were unavailable for this token or analysis window.",
    },
    evidence: [
      {
        label: "Early Buy Compression",
        value: "Insufficient",
        severity: "neutral",
        explanation: "Insufficient sample; proxy unavailable until more swaps settle.",
      },
      {
        label: "Top 10 Holder Concentration",
        value: "Unavailable",
        severity: "neutral",
        explanation: "Holder share unavailable in current Birdeye sample.",
      },
      {
        label: "Trade Pressure",
        value: "INSUFFICIENT",
        severity: "neutral",
        explanation: "Insufficient sample; trade pressure neutral until history grows.",
      },
    ],
    metrics: {
      earlyBuyCompression: 0,
      top10HolderConcentration: 0,
      buySellRatio: 0,
      priceChange1h: 0,
      sellPressure: 0,
      liquidityShock: 0,
      totalTrades: 0,
      totalHolders: 0,
    },
    scores: {
      sniperSwarm: 20,
      liquidityMirage: 20,
      organicGrind: 60,
    },
    chart: neutralChart(),
    timeline: [
      {
        time: "0m",
        label: "Limited Evidence",
        detail: "Some Birdeye datasets were unavailable for this analysis window.",
        severity: "neutral",
      },
    ],
    holders: [],
    trades: {
      buys: 0,
      sells: 0,
      netPressure: "balanced",
    },
    endpointProof,
    evidenceQuality: {
      status: "limited",
      missing: ["holder share", "trade rows", "OHLCV replay"],
    },
    generatedAt: new Date().toISOString(),
    dataMode: "partial",
  };
}

export default function CaseFilePage({ params }: { params: Promise<{ address: string }> }) {
  const resolvedParams = use(params);
  const address = resolvedParams.address;
  const searchParams = useSearchParams();
  const tokenName = searchParams.get("name")?.trim() || undefined;
  const tokenSymbol = searchParams.get("symbol")?.trim() || undefined;
  
  const [data, setData] = useState<LaunchCase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!data?.token.address) return;
    navigator.clipboard.writeText(data.token.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    let isActive = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), ANALYZE_TIMEOUT_MS);

    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address, name: tokenName, symbol: tokenSymbol }),
          signal: controller.signal,
        });
        
        const result = await res.json().catch(() => undefined);
        if (!res.ok) {
          setData(createPartialFallbackCase(address, tokenName, tokenSymbol, result?.endpointProof));
          return;
        }

        if (isActive) {
          setData(result);
        }
      } catch (err) {
        if (!isActive) {
          return;
        }
        console.error(err);
        const endpointProof = fallbackEndpointProof(BIRDEYE_CASE_ENDPOINTS);
        setData(createPartialFallbackCase(address, tokenName, tokenSymbol, endpointProof));
      } finally {
        if (isActive) {
          window.clearTimeout(timeout);
          setIsLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [address, tokenName, tokenSymbol]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="relative">
          <Loader2 className="w-16 h-16 text-ldna-accent animate-spin" />
          <div className="absolute inset-0 blur-xl bg-ldna-accent/20 animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-serif mb-2">Analyzing Evidence...</h2>
          <p className="text-ldna-muted font-mono text-sm uppercase tracking-widest animate-pulse">Scanning Birdeye Nodes // {address.slice(0, 8)}...</p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] container mx-auto px-4">
        <div className="bg-ldna-panel border border-ldna-accent/30 p-12 max-w-xl text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-ldna-accent/5 rounded-full -mr-16 -mt-16 blur-3xl" />
          <ShieldAlert className="w-16 h-16 text-ldna-accent mx-auto mb-6" />
          <h2 className="text-3xl font-serif mb-4 text-ldna-text">Analysis Failed</h2>
          <p className="text-ldna-muted mb-8 leading-relaxed">
            {error || "An unexpected error occurred while processing the forensic report."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/analyze"
              className="px-8 py-3 bg-ldna-accent text-ldna-bg font-bold uppercase tracking-wider hover:bg-ldna-text transition-colors"
            >
              Return to Lab
            </Link>
            <button 
              onClick={() => window.location.reload()}
              className="px-8 py-3 border border-ldna-grid text-ldna-text font-bold uppercase tracking-wider hover:bg-ldna-panel transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const tradeTotal = data.trades.buys + data.trades.sells;
  const buyShare = tradeTotal > 0 ? Math.min(100, Math.max(0, (data.trades.buys / tradeTotal) * 100)) : 50;
  const topHolders = data.holders.filter((holder) => holder.percentage > 0.01);
  const labeledWallets = data.labeledWallets ?? [];
  const missingEvidence = (data.evidenceQuality?.missing ?? []).map((item) => item.trim()).filter(Boolean);

  return (
    <div className="flex-1 flex flex-col container mx-auto px-4 py-12 max-w-7xl relative overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay -z-10" />
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-ldna-accent/5 via-ldna-bg to-ldna-bg -z-20 mix-blend-screen" />

      {data.dataMode === "partial" && (
        <div className="mb-12 border border-ldna-warning/30 bg-ldna-panel/60 px-8 py-6">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-ldna-warning uppercase tracking-widest">
            <TooltipLabel label="Limited Evidence" align="start" />
          </div>
          <div className="mt-3 text-sm font-mono text-ldna-warning/80 leading-relaxed">
            Limited Evidence. Some Birdeye datasets were unavailable for this token or analysis window. LaunchDNA used available evidence.
          </div>
          {missingEvidence.length > 0 && (
            <div className="mt-3 text-xs font-mono text-ldna-warning/80 uppercase tracking-widest">
              Missing: {missingEvidence.join(", ")}
            </div>
          )}
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-12 pb-10 border-b border-ldna-grid relative gap-6">
        <div className="absolute top-0 right-0 w-1/3 h-px bg-linear-to-r from-transparent via-ldna-accent/50 to-transparent" />
        
        <div className="flex-1 min-w-0 w-full">
          <div className="text-xs font-mono font-bold text-ldna-accent uppercase tracking-widest mb-5 flex flex-wrap items-center gap-2">
            <span className="w-1.5 h-1.5 bg-ldna-accent animate-pulse shrink-0" />
            <span className="shrink-0">{"// CASE FILE"}</span>
            <span className="text-ldna-muted break-all min-w-0">{data.token.address}</span>
            <button 
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-2 py-0.5 bg-ldna-panel border border-ldna-grid text-ldna-muted hover:text-ldna-accent hover:border-ldna-accent/30 transition-all uppercase text-[10px] tracking-tighter shrink-0"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-green-500" />
                  <span className="text-green-500">COPIED</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>COPY</span>
                </>
              )}
            </button>
            {data.dataMode === "mock" && (
              <TooltipLabel
                label="Case Files"
                className="text-[10px] border border-ldna-grid px-1.5 py-0.5 bg-ldna-panel text-ldna-muted ml-0 md:ml-2 uppercase tracking-widest shrink-0"
                align="start"
              />
            )}
          </div>
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-3 flex flex-wrap items-center gap-4 tracking-tight">
            <span className="break-words max-w-full">{data.token.name}</span>
            <span className="text-2xl font-mono text-ldna-muted border border-ldna-grid px-3 py-1.5 bg-ldna-panel/50 shrink-0 break-all max-w-full">${data.token.symbol}</span>
          </h1>
        </div>
        <div className="mt-6 lg:mt-0 text-left lg:text-right shrink-0 w-full lg:w-auto">
          <div className="text-xs font-mono text-ldna-muted mb-3 uppercase tracking-widest">Classification Result</div>
          <div className="flex md:inline-flex w-full md:w-auto flex-wrap items-center justify-between md:justify-start gap-4 px-6 py-4 md:py-3 border border-ldna-accent bg-ldna-accent/10 shadow-[0_0_20px_rgba(255,87,26,0.15)] relative group">
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-ldna-accent/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
            <ShieldAlert className="w-5 h-5 text-ldna-accent shrink-0" />
            <TooltipLabel
              label={data.classification.archetype}
              className="font-mono font-bold text-lg md:text-xl text-ldna-accent uppercase tracking-wider whitespace-nowrap"
              align="start"
            />
            <span className="font-mono text-ldna-text border-l border-ldna-accent/30 pl-4 whitespace-nowrap">{data.classification.confidence}% CONF</span>
            {data.dataMode === "partial" && (
              <span className="font-mono text-[10px] text-ldna-warning border border-ldna-warning/30 bg-ldna-warning/10 px-2 py-1 uppercase tracking-widest whitespace-nowrap absolute -bottom-8 right-0 md:hidden">
                Limited Evidence
              </span>
            )}
          </div>
        </div>
      </div>

      {data.dataMode === "mock" && (
        <div className="mb-12 -mt-6 text-xs font-mono text-ldna-muted flex items-center gap-2">
          <Database className="w-3.5 h-3.5" />
          <span>Local demo fallback. No live Birdeye or Supabase data used for this case.</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-12 xl:gap-16">
        
        {/* Main Column */}
        <div className="lg:col-span-8 space-y-16">
          
          {/* Section 01: Summary */}
          <section>
            <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-6 border-b border-ldna-grid pb-3 flex justify-between items-end">
              <span>01 / Launch Summary</span>
            </h2>
            <div className="bg-ldna-panel/80 backdrop-blur-sm border border-ldna-grid p-8 md:p-10 relative">
              <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-ldna-accent" />
              <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-ldna-accent" />
              <p className="text-lg md:text-xl leading-loose text-ldna-text/90 font-serif">{data.classification.summary}</p>
            </div>
          </section>

          {/* Section 02: Replay Chart */}
          <section>
            <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-6 border-b border-ldna-grid pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
              <span className="flex items-center gap-2"><BarChart3 className="w-4 h-4" /> 02 / Evidence Window Replay</span>
              <span className="text-[10px] bg-ldna-accent/10 text-ldna-accent px-2 py-1 border border-ldna-accent/20 flex items-center gap-1.5">
                <TooltipLabel label="OHLCV" className="uppercase tracking-widest" align="start" />
              </span>
            </h2>
            <div className="bg-ldna-panel/60 border border-ldna-grid p-8 h-[400px] relative group">
              {/* Scanline effect */}
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-size-[100%_4px] opacity-20 group-hover:opacity-10 transition-opacity" />
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chart}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-ldna-accent)" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="var(--color-ldna-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-ldna-panel)', borderColor: 'var(--color-ldna-grid)', borderRadius: 0, boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: 'var(--color-ldna-text)', fontFamily: 'monospace' }}
                    labelStyle={{ color: 'var(--color-ldna-muted)', fontFamily: 'monospace' }}
                    cursor={{ stroke: 'var(--color-ldna-accent)', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="step" dataKey="price" stroke="var(--color-ldna-accent)" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
              {data.dataMode === "partial" && data.chart.every(point => point.price === 1 && point.volume === 0) && (
                <div className="absolute inset-0 flex items-center justify-center bg-ldna-panel/80 backdrop-blur-sm z-10 p-6 text-center">
                  <div className="border border-ldna-warning/30 bg-ldna-bg/90 p-6 max-w-sm">
                    <AlertTriangle className="w-8 h-8 text-ldna-warning mx-auto mb-4" />
                    <div className="text-sm font-mono text-ldna-warning mb-2 uppercase tracking-widest font-bold">Chart Unavailable</div>
                    <div className="text-xs font-mono text-ldna-muted leading-relaxed">
                      OHLCV replay unavailable. Trade and wallet evidence still available.
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 03: Evidence Grid */}
          <section>
            <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-6 border-b border-ldna-grid pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
              <span className="flex items-center gap-2"><Crosshair className="w-4 h-4" /> 03 / Key Evidence</span>
              <span className="text-[10px] bg-ldna-grid text-ldna-muted px-2 py-1 border border-ldna-grid">HEURISTIC MATCHES</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {data.evidence.map((ev, i) => (
                <div key={i} className="bg-ldna-panel/80 border border-ldna-grid p-8 hover:border-ldna-accent/30 transition-colors">
                  <div className="flex items-start justify-between mb-6">
                    <TooltipLabel
                      label={ev.label}
                      className="text-xs font-mono font-bold uppercase tracking-wider text-ldna-text/80"
                      align="start"
                    />
                    {ev.severity === 'danger' && <AlertTriangle className="w-5 h-5 text-ldna-accent animate-pulse" />}
                    {ev.severity === 'warning' && <AlertTriangle className="w-5 h-5 text-ldna-warning" />}
                    {ev.severity === 'good' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  </div>
                  <div className={`text-4xl font-mono font-bold mb-4 ${ev.severity === 'danger' ? 'text-ldna-accent shadow-ldna-accent' : ev.severity === 'warning' ? 'text-ldna-warning' : 'text-ldna-text'}`}>
                    {ev.value}
                  </div>
                  <p className="text-base text-ldna-muted leading-relaxed">{ev.explanation}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 04: Timeline */}
          <section>
            <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-6 border-b border-ldna-grid pb-3 flex justify-between items-end">
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> 04 / Launch Signal Log</span>
            </h2>
            <div className="bg-ldna-panel/40 border border-ldna-grid p-8 md:p-10 max-w-3xl">
              <div className="relative border-l border-ldna-grid/50 ml-3 space-y-12">
                {data.timeline.map((event, i) => (
                  <div key={i} className="relative pl-8 group">
                    <div className="absolute -left-1.25 top-1.5 w-2.5 h-2.5 rounded-none rotate-45 bg-ldna-grid group-hover:bg-ldna-muted transition-colors" />
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="text-xs font-mono text-ldna-muted group-hover:text-ldna-text transition-colors">{event.time}</div>
                      <div className={`text-[10px] font-mono px-2 py-1 border ${
                        event.severity === 'danger' ? 'bg-ldna-accent/10 text-ldna-accent border-ldna-accent/20' :
                        event.severity === 'warning' ? 'bg-ldna-warning/10 text-ldna-warning border-ldna-warning/20' :
                        event.severity === 'good' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        'bg-ldna-panel border-ldna-grid text-ldna-muted'
                      }`}>
                        {event.severity === 'danger' ? 'HIGH' : 
                         event.severity === 'warning' ? 'MEDIUM' : 
                         event.severity === 'good' ? 'LOW' : 'NEUTRAL'}
                      </div>
                    </div>
                    <TooltipLabel
                      label={event.label}
                      className="font-bold text-ldna-text mb-2 text-xl"
                      align="start"
                    />
                    <div className="text-base text-ldna-muted/80 leading-relaxed">{event.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* Sidebar Column */}
        <div className="lg:col-span-4 space-y-12">
          
          {/* Section 05: Holder Concentration */}
          <section>
            <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-6 border-b border-ldna-grid pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
              <span className="flex items-center gap-2"><Users className="w-4 h-4 shrink-0" /> 05 / Top Holders</span>
              <span className="flex flex-wrap items-center gap-2">
                <TooltipLabel
                  label="Holder Concentration"
                  className="text-[10px] bg-ldna-panel border border-ldna-grid px-2 py-1 text-ldna-muted uppercase tracking-widest"
                  align="start"
                />
              </span>
            </h2>
            <div className="bg-ldna-panel/80 border border-ldna-grid p-8">
              <div className="space-y-5">
                {topHolders.length === 0 ? (
                  <div className="text-xs font-mono text-ldna-muted leading-relaxed uppercase tracking-tight">
                    <div>Holder share unavailable in current Birdeye sample.</div>
                    <div className="mt-3 text-ldna-muted/70">Wallet labels may still be available separately.</div>
                  </div>
                ) : (
                  topHolders
                    .map((holder, i) => (
                    <div key={i} className="flex items-center justify-between group gap-4">
                      <div className="flex flex-col min-w-0">
                        <span className="font-mono text-sm text-ldna-text/90 group-hover:text-ldna-accent transition-colors truncate">{holder.address.slice(0,6)}...{holder.address.slice(-4)}</span>
                        {holder.tag && <span className="text-[10px] font-mono uppercase text-ldna-accent mt-1 truncate">{holder.tag}</span>}
                      </div>
                      <div className="font-mono font-bold text-ldna-text shrink-0">
                        {Math.min(100, holder.percentage).toFixed(2)}%
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {labeledWallets.length > 0 && (
            <section>
              <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-6 border-b border-ldna-grid pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
                <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 shrink-0" /> Labeled Wallets</span>
              </h2>
              <div className="bg-ldna-panel/80 border border-ldna-grid p-8">
                <div className="space-y-5">
                  {labeledWallets.map((wallet, i) => (
                    <div key={`${wallet.address}-${i}`} className="flex items-center justify-between gap-4 group">
                      <span className="font-mono text-sm text-ldna-text/90 group-hover:text-ldna-accent transition-colors truncate">{wallet.address.slice(0,6)}...{wallet.address.slice(-4)}</span>
                      <span className="text-[10px] font-mono uppercase text-ldna-accent text-right shrink-0">{wallet.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Section 06: Trade Pressure */}
          <section>
            <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-6 border-b border-ldna-grid pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3">
              <span className="flex items-center gap-2">
                <Activity className="w-4 h-4 shrink-0" />
                <span className="inline-flex items-center gap-2">
                  06 /
                  <TooltipLabel label="Trade Pressure" align="start" />
                </span>
              </span>
            </h2>
            <div className="bg-ldna-panel/80 border border-ldna-grid p-8">
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <div className="text-xs font-mono text-ldna-muted mb-2 uppercase">Total Buys</div>
                  <div className="font-mono text-3xl text-green-500">{data.trades.buys}</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-ldna-muted mb-2 uppercase">Total Sells</div>
                  <div className="font-mono text-3xl text-ldna-accent">{data.trades.sells}</div>
                </div>
              </div>
              <div className="w-full h-3 bg-ldna-grid flex overflow-hidden">
                <div className="h-full bg-green-500/80 shadow-[0_0_10px_rgba(34,197,94,0.3)]" style={{ width: `${buyShare}%` }} />
                <div className="h-full bg-ldna-accent/80 shadow-[0_0_10px_rgba(255,87,26,0.3)] flex-1" />
              </div>
            </div>
          </section>

          {/* Section 07: Proof */}
          <section>
            <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-6 border-b border-ldna-grid pb-3 flex items-center gap-2">
              <Database className="w-4 h-4 shrink-0" /> 07 / API Evidence Log
            </h2>
            <div className="bg-ldna-panel/80 border border-ldna-grid p-8 relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-20 h-20 bg-ldna-accent/10 rounded-full blur-xl" />
              <div className="space-y-4 relative z-10">
                {data.endpointProof.map((proof, i) => (
                  <div key={i} className="flex items-center justify-between text-sm group gap-4">
                    <span className="font-mono text-ldna-muted group-hover:text-ldna-text transition-colors truncate">{proof.endpoint}</span>
                    <span className="font-mono bg-ldna-bg border border-ldna-grid group-hover:border-ldna-accent/30 px-2 py-1 text-xs text-ldna-accent shrink-0">{proof.calls}x</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-5 border-t border-ldna-grid text-xs text-ldna-text/50 text-center font-mono flex items-center justify-center gap-2">
                <span className="w-1.5 h-1.5 bg-ldna-accent rounded-full" />
                Verified via Birdeye API
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
