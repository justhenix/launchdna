import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-ldna-grid bg-ldna-bg">
      <div className="container mx-auto max-w-7xl px-6 md:px-10 py-12 md:py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Image
                src="/launchdna.svg"
                alt="LaunchDNA"
                width={20}
                height={20}
                className="opacity-80"
              />
              <span className="font-mono font-bold text-lg">LaunchDNA</span>
            </div>
            <p className="text-ldna-muted text-sm max-w-sm mb-6 leading-relaxed">
              Every Token Launch Leaves Evidence. LaunchDNA replays an evidence window and classifies observed Solana token behavior into sniper swarms, liquidity mirages, and organic grinds.
            </p>
            <div className="flex items-center gap-4 text-ldna-muted">
              <a href="https://github.com/justhenix/launchdna" target="_blank" rel="noreferrer" className="hover:text-ldna-accent hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </a>
              <a href="https://x.com/birdeye_data" target="_blank" rel="noreferrer" className="hover:text-ldna-accent hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.36l4.73 6.258L18.244 2.25z"/></svg>
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
                <Link href="/#featured-cases" className="hover:text-ldna-accent transition-colors">Case Files</Link>
              </li>
              <li>
                <Link href="/proof" className="hover:text-ldna-accent transition-colors">Architecture & Proof</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-mono text-sm font-bold mb-4 uppercase tracking-wider text-ldna-text">Resources</h4>
            <ul className="space-y-3 text-sm text-ldna-muted">
              <li>
                <a href="https://github.com/justhenix/launchdna" target="_blank" rel="noreferrer" className="hover:text-ldna-accent transition-colors">Documentation</a>
              </li>
              <li>
                <Link href="/" className="hover:text-ldna-accent transition-colors">Live App</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-ldna-grid pt-6 flex flex-col md:flex-row justify-between gap-4 text-xs font-mono text-ldna-muted">
          <p>© {new Date().getFullYear()} LaunchDNA. All rights reserved.</p>
          <div>
            <span>Powered by Birdeye Data API</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
