// Static integration strip. Global proof counters were removed from production UI.

export default function LiveMetricStrip() {
  const STATIC_SAFE_METRICS = [
    { label: "BIRDEYE ENDPOINTS", value: "7" },
    { label: "CHAIN", value: "SOLANA" },
    { label: "CLASSIFIERS", value: "3" },
    { label: "MODE", value: "EVIDENCE" },
  ];

  return (
    <section className="bg-ldna-grid border-b border-ldna-grid">
      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px">
          {STATIC_SAFE_METRICS.map((metric, i) => (
            <div key={i} className="p-8 text-center bg-ldna-panel/90 backdrop-blur-md hover:bg-ldna-panel transition-colors relative">
              <div className="text-3xl md:text-4xl font-mono font-bold text-ldna-text mb-3">
                {metric.value}
              </div>
              <div className="text-xs uppercase tracking-widest text-ldna-muted font-bold">{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
