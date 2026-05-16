# LaunchDNA

**Every Token Launch Leaves Evidence.**

LaunchDNA is a forensic case-file generator for Solana tokens. Paste a token address, and it uses Birdeye data to explain the token's launch behavior or current evidence window.

Live Demo: https://launchdna.vercel.app  
Repository: https://github.com/justhenix/launchdna
X post: https://x.com/heni0x/status/2055497104983032163?s=20
Built for: Birdeye Data 4-Week BIP Competition, Sprint 4

## What It Does

LaunchDNA turns Birdeye token, trade, holder, security, and OHLCV data into forensic reports.

It classifies observed behavior into:

- **Sniper Swarm**: compressed early buys, suspicious wallet activity, and aggressive launch movement.
- **Liquidity Mirage**: volume spikes, weak follow-through, sell pressure, and unstable behavior.
- **Organic Grind**: smoother movement, healthier distribution, and more balanced trade pressure.

## Core Flow

```txt
Token address
-> Birdeye API
-> LaunchCase object
-> Heuristic classifier
-> Forensic case file
```

## Birdeye Endpoints Used

- `/defi/v2/tokens/new_listing`
- `/defi/token_overview`
- `/defi/token_security`
- `/defi/v3/ohlcv`
- `/defi/v3/token/txs`
- `/defi/v3/token/holder`
- `/token/v1/holder-positions`

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Recharts
- Birdeye API
- Vercel

## Local Setup

```bash
bun install
cp .env.example .env
```

```env
BIRDEYE_API_KEY=your_birdeye_api_key
```

```bash
bun dev
bun run lint
bun run build
```

## Disclaimer

LaunchDNA is a forensic analysis tool. It does not execute trades, provide financial advice, or predict profits.
