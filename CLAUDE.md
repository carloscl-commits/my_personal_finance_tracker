# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev       # Start dev server (http://localhost:3000)
npm run build     # Production build
npm run lint      # ESLint
```

No test framework is configured.

## Architecture

Client-only personal finance app — **no backend, no API routes, no database**. All data lives in the browser.

### State & Data Flow

Two independent stores, each exposed via React Context:

- **FinanceStore** (`useFinanceStore` → `FinanceProvider` → `useFinance()`) — transactions, categories, recurring rules, settings. Persisted to localStorage key `finance_app_data`.
- **AuthStore** (`useAuthStore` → `AuthProvider` → `useAuth()`) — credentials (SHA-256 hashed via Web Crypto), session flag. Credentials in localStorage key `finance_app_auth`, session in sessionStorage key `finance_app_session`.

`ClientLayout` nests both providers and implements `AuthGate` — blocks all finance UI until authenticated.

### Monetary Values

**All amounts are stored in cents** (integers). `$55.00` → `5500`. Use:
- `formatCurrency(cents, currency)` to display
- `parseCurrencyToCents(string)` to parse user input

### Key Behaviors

- **Recurring auto-generation**: On store init, weekly/monthly rules auto-spawn transactions up to today using `lastGeneratedDate` cursor. Avoid triggering duplicate generation.
- **Category deletion fallback**: Deleting a category remaps all linked transactions and rules to `"cat-other"`.
- **Hydration safety**: Both stores check `typeof window === 'undefined'` before accessing storage, returning defaults on the server.
- **Seed data**: First load creates 15 sample transactions across 2 months.

### Theming

CSS custom properties in `globals.css` with light/dark mode via `[data-theme="dark"]`. Variables are bridged to Tailwind via `@theme inline`. Users can customize the accent color (`setAccentColor`), persisted in FinanceData.

Fonts: Inter (body), Space Grotesk (headings).

### Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 4 · Recharts 3 · date-fns 4 · Lucide icons. All UI components are custom (no component library). Path alias `@/*` → `./src/*`.
