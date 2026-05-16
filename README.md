# LaunchDNA

Every Token Launch Leaves Evidence.

[Live Demo Placeholder](#) | [GitHub Repository Placeholder](#) | [X Thread Placeholder](#)

LaunchDNA is a post-discovery forensic explanation layer for Solana tokens. Find tokens anywhere, paste the address here, and LaunchDNA explains the launch using Birdeye data. It replays launch behavior or a recent evidence window to generate a forensic case file based on evidence, not hype.

## What It Does

LaunchDNA classifies Solana token launch behavior from available Birdeye evidence. Instead of acting as a faster scanner for trading like Trojan or pump.fun, it acts as an investigation lab. Users paste a Solana token address, and the system evaluates market, trade, holder, security, and OHLCV data to classify the behavior into specific archetypes.

## Why It Is Different

Token radars show movement. LaunchDNA shows evidence. It avoids generic metrics and focuses on explainable heuristics. Every classification is backed by concrete data points, resulting in Case Files rather than a standard crypto UI.

## Core User Flow

1. User pastes a Solana token address or selects a new listing.
2. The application fetches data from multiple Birdeye API endpoints.
3. The system normalizes the data into a unified `LaunchCase` object.
4. The heuristic classifier processes the `LaunchCase`.
5. The UI presents a detailed forensic case file with evidence cards and an evidence-window replay chart.
6. The user can view the API proof page verifying the data origin and endpoint calls.

## Launch Archetypes

Tokens are classified into one of three archetypes based on forensic evidence:

*   **Sniper Swarm**: High holder concentration, fast evidence-window price spikes, compressed early buys, and suspicious trade pressure.
*   **Liquidity Mirage**: Early volume spikes followed by weak post-spike structure, increasing sell pressure, and unstable price to liquidity ratios.
*   **Organic Grind**: Smoother price movements, healthier token distribution, lower top holder concentration, and balanced buy/sell pressure.

## Architecture

New listing or pasted token -> Birdeye API -> Normalized `LaunchCase` -> Heuristic Classifier -> Forensic Case File

### Data Contract

The `LaunchCase` object is the core data contract powering both the UI and backend. The application is built to handle partial evidence gracefully. Very new tokens may have incomplete Birdeye history; LaunchDNA processes what is available and returns a partial case safely without failing.

### Classification Logic

The classifier uses explainable heuristics. It relies on strict thresholds and evidence scoring based on the `LaunchCase` data, ensuring the results are transparent and avoid black-box ML models.

## Birdeye Endpoints Used

LaunchDNA integrates deeply with the Birdeye API to source forensic data:

*   `/defi/v2/tokens/new_listing`
*   `/defi/token_overview`
*   `/defi/token_security`
*   `/defi/v3/ohlcv`
*   `/defi/v3/token/txs`
*   `/defi/v3/token/holder`
*   `/token/v1/holder-positions`

## Tech Stack

*   Next.js
*   TypeScript
*   Tailwind CSS
*   Recharts
*   Birdeye API

## Local Setup

Ensure you have Bun installed.

```bash
bun install
cp .env.example .env
```

Set your environment variables in `.env`:
```env
BIRDEYE_API_KEY=your_api_key_here
```

### Vercel Environment Variables

Set these in Vercel before demo deployment:

```env
BIRDEYE_API_KEY=your_birdeye_api_key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
# or SUPABASE_SECRET_KEY=your_secret_key
```

`SUPABASE_SERVICE_ROLE_KEY` / `SUPABASE_SECRET_KEY` must stay server-side only.
Run `supabase/setup-supabase.sql` in the Supabase SQL editor to create `launchdna_api_calls` and `case_files`.

Run the application:
```bash
bun dev
bun run lint
bun run build
```

## Screenshots

*   [Landing Page Screenshot Placeholder]
*   [Analyzer Interface Screenshot Placeholder]
*   [Forensic Case File Screenshot Placeholder]
*   [API Proof Page Screenshot Placeholder]

## Purpose

LaunchDNA is a forensic analysis tool designed to help users understand the mechanics of Solana token launches.

*Disclaimer: LaunchDNA is a forensic analysis tool. It does not predict profits and is not financial advice.*
