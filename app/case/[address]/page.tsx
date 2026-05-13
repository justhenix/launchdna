"use client";

// import { use } from "react";
import { MOCK_LAUNCH_CASE } from "@/lib/mock/launch-case";
import { AlertTriangle, CheckCircle2, ShieldAlert, BarChart3, Clock, Database, Crosshair, Users, Activity } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function CaseFilePage({ params: _params }: { params: Promise<{ address: string }> }) {
  // const resolvedParams = use(params);
  const data = MOCK_LAUNCH_CASE;

  return (
    <div className="flex-1 flex flex-col container mx-auto px-4 py-8 max-w-6xl">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 pb-8 border-b border-ldna-grid">
        <div>
          <div className="text-xs font-mono font-bold text-ldna-accent uppercase tracking-widest mb-4 flex items-center gap-2">
            <span>{"// CASE FILE"}</span>
            <span className="text-ldna-muted">{data.token.address.slice(0,8)}...</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-2 flex items-center gap-4">
            {data.token.name}
            <span className="text-2xl font-mono text-ldna-muted">${data.token.symbol}</span>
          </h1>
        </div>
        <div className="mt-6 md:mt-0 text-left md:text-right">
          <div className="text-xs font-mono text-ldna-muted mb-2 uppercase">Classification Result</div>
          <div className="inline-flex items-center gap-3 px-4 py-2 border border-ldna-accent bg-ldna-accent/10">
            <ShieldAlert className="w-5 h-5 text-ldna-accent" />
            <span className="font-mono font-bold text-lg text-ldna-accent uppercase tracking-wider">{data.classification.archetype}</span>
            <span className="font-mono text-ldna-text border-l border-ldna-accent/30 pl-3">{data.classification.confidence}% CONF</span>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* Section 01: Summary */}
          <section>
            <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-4 border-b border-ldna-grid pb-2">
              01 / Launch Summary
            </h2>
            <div className="bg-ldna-panel border border-ldna-grid p-6">
              <p className="text-lg leading-relaxed">{data.classification.summary}</p>
            </div>
          </section>

          {/* Section 02: Replay Chart */}
          <section>
            <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-4 border-b border-ldna-grid pb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> 02 / First-Hour Replay
            </h2>
            <div className="bg-ldna-panel border border-ldna-grid p-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.chart}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-ldna-accent)" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="var(--color-ldna-accent)" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" hide />
                  <YAxis hide domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--color-ldna-panel)', borderColor: 'var(--color-ldna-grid)', borderRadius: 0 }}
                    itemStyle={{ color: 'var(--color-ldna-text)', fontFamily: 'monospace' }}
                    labelStyle={{ color: 'var(--color-ldna-muted)', fontFamily: 'monospace' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="var(--color-ldna-accent)" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </section>

          {/* Section 03: Evidence Grid */}
          <section>
            <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-4 border-b border-ldna-grid pb-2 flex items-center gap-2">
              <Crosshair className="w-4 h-4" /> 03 / Key Evidence
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.evidence.map((ev, i) => (
                <div key={i} className="bg-ldna-panel border border-ldna-grid p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-xs font-mono font-bold uppercase tracking-wider text-ldna-text">{ev.label}</div>
                    {ev.severity === 'danger' && <AlertTriangle className="w-4 h-4 text-ldna-accent" />}
                    {ev.severity === 'warning' && <AlertTriangle className="w-4 h-4 text-ldna-warning" />}
                    {ev.severity === 'good' && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                  </div>
                  <div className={`text-2xl font-mono font-bold mb-2 ${ev.severity === 'danger' ? 'text-ldna-accent' : ev.severity === 'warning' ? 'text-ldna-warning' : 'text-ldna-text'}`}>
                    {ev.value}
                  </div>
                  <p className="text-sm text-ldna-muted">{ev.explanation}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Section 04: Timeline */}
          <section>
            <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-4 border-b border-ldna-grid pb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" /> 04 / Launch Timeline
            </h2>
            <div className="bg-ldna-panel border border-ldna-grid p-6">
              <div className="relative border-l border-ldna-grid ml-3 space-y-8">
                {data.timeline.map((event, i) => (
                  <div key={i} className="relative pl-8">
                    <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full ${
                      event.severity === 'danger' ? 'bg-ldna-accent' : 
                      event.severity === 'warning' ? 'bg-ldna-warning' : 'bg-ldna-muted'
                    }`} />
                    <div className="text-xs font-mono text-ldna-muted mb-1">{event.time}</div>
                    <div className="font-bold text-ldna-text mb-1">{event.label}</div>
                    <div className="text-sm text-ldna-muted">{event.detail}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          
          {/* Section 05: Holder Concentration */}
          <section>
            <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-4 border-b border-ldna-grid pb-2 flex items-center gap-2">
              <Users className="w-4 h-4" /> 05 / Top Holders
            </h2>
            <div className="bg-ldna-panel border border-ldna-grid p-6">
              <div className="space-y-4">
                {data.holders.map((holder, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="font-mono text-sm text-ldna-text">{holder.address.slice(0,6)}...{holder.address.slice(-4)}</span>
                      {holder.tag && <span className="text-[10px] font-mono uppercase text-ldna-accent">{holder.tag}</span>}
                    </div>
                    <div className="font-mono font-bold text-ldna-text">{holder.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Section 06: Trade Pressure */}
          <section>
            <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-4 border-b border-ldna-grid pb-2 flex items-center gap-2">
              <Activity className="w-4 h-4" /> 06 / Trade Pressure
            </h2>
            <div className="bg-ldna-panel border border-ldna-grid p-6">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <div className="text-xs font-mono text-ldna-muted mb-1 uppercase">Total Buys</div>
                  <div className="font-mono text-xl text-green-500">{data.trades.buys}</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-ldna-muted mb-1 uppercase">Total Sells</div>
                  <div className="font-mono text-xl text-ldna-accent">{data.trades.sells}</div>
                </div>
              </div>
              <div className="w-full h-2 bg-ldna-grid flex">
                <div className="h-full bg-green-500" style={{ width: `${(data.trades.buys / (data.trades.buys + data.trades.sells)) * 100}%` }} />
                <div className="h-full bg-ldna-accent flex-1" />
              </div>
            </div>
          </section>

          {/* Section 07: Proof */}
          <section>
            <h2 className="text-xs font-mono font-bold text-ldna-muted uppercase tracking-widest mb-4 border-b border-ldna-grid pb-2 flex items-center gap-2">
              <Database className="w-4 h-4" /> 07 / API Proof
            </h2>
            <div className="bg-ldna-panel border border-ldna-grid p-6">
              <div className="space-y-3">
                {data.endpointProof.map((proof, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-mono text-ldna-muted">{proof.endpoint}</span>
                    <span className="font-mono bg-ldna-grid px-2 py-0.5 text-xs">{proof.calls}x</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-ldna-grid text-xs text-ldna-muted text-center font-mono">
                Powered by Birdeye Data API
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
