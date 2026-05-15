import Link from "next/link";
import Image from "next/image";
import { Search, ShieldAlert, BarChart3 } from "lucide-react";

export function NavBar() {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-ldna-grid bg-ldna-bg/80 backdrop-blur-md">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <Image
              src="/launchdna.svg"
              alt="LaunchDNA"
              width={24}
              height={24}
              className="transition-opacity duration-200 group-hover:opacity-80"
            />
            <span className="font-mono font-bold text-xl tracking-tight hidden sm:block">LaunchDNA</span>
          </Link>

          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-ldna-muted ml-6 min-w-0">
            <Link href="/analyze" className="hover:text-ldna-text transition-colors flex items-center gap-2 truncate">
              <Search className="w-4 h-4 shrink-0" />
              Analyzer
            </Link>
            <Link href="/case/mock-token" className="hover:text-ldna-text transition-colors flex items-center gap-2 truncate">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              Birdeye Snapshot Case
            </Link>
            <Link href="/proof" className="hover:text-ldna-text transition-colors flex items-center gap-2 truncate">
              <BarChart3 className="w-4 h-4 shrink-0" />
              Proof
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <a
            href="https://github.com/justhenix/launchdna"
            target="_blank"
            rel="noreferrer"
            className="text-ldna-muted hover:text-ldna-text transition-colors hidden sm:block"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </a>
          <Link
            href="/analyze"
            className="bg-ldna-accent text-ldna-bg px-4 py-2 text-sm font-bold hover:bg-ldna-text transition-colors uppercase tracking-wider shrink-0"
          >
            Analyze
          </Link>
        </div>
      </div>
    </nav>
  );
}
