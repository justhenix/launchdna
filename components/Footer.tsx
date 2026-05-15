import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-ldna-grid bg-ldna-panel mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-ldna-accent" />
              <span className="font-mono font-bold text-lg">LaunchDNA</span>
            </div>
            <p className="text-ldna-muted text-sm max-w-sm mb-6 leading-relaxed">
              Every Token Launch Leaves Evidence. We replay the first hour of Solana token launches to classify sniper swarms, liquidity mirages, and organic grinds.
            </p>
            <div className="flex items-center gap-4 text-ldna-muted">
              <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-ldna-text transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </a>
              <a href="https://twitter.com/birdeye_data" target="_blank" rel="noreferrer" className="hover:text-ldna-text transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-mono text-sm font-bold mb-4 uppercase tracking-wider text-ldna-text">Product</h4>
            <ul className="space-y-3 text-sm text-ldna-muted">
              <li>
                <Link href="/analyze" className="hover:text-ldna-accent transition-colors">Analyzer</Link>
              </li>
              <li>
                <Link href="/case/mock-token" className="hover:text-ldna-accent transition-colors">Birdeye Snapshot Case</Link>
              </li>
              <li>
                <Link href="/proof" className="hover:text-ldna-accent transition-colors">Architecture & Proof</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-sm font-bold mb-4 uppercase tracking-wider text-ldna-text">Competition</h4>
            <ul className="space-y-3 text-sm text-ldna-muted">
              <li>Built for Birdeye BIP Sprint 4</li>
              <li>Superteam Earn Submission</li>
              <li>
                <a href="#" className="hover:text-ldna-accent transition-colors">Live App</a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-ldna-grid mt-12 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-ldna-muted font-mono">
          <p>© {new Date().getFullYear()} LaunchDNA. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <span>Powered by Birdeye Data API</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
