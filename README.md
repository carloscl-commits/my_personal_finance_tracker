# Cashflow — Personal Finance Tracker

A client-side personal finance application built with Next.js, TypeScript, and Tailwind CSS. All data persists in the browser via localStorage — no backend, no database, no API calls.

## Features

- **Dashboard** — Monthly summary cards (income, expenses, net balance), 6-month income vs. expenses area chart, spending-by-category donut chart, and 5 most recent transactions
- **Transactions** — Full CRUD with search by description, filters (type, category, date range), and sorting by date or amount
- **Categories** — 9 built-in categories with color coding; create, rename, and delete custom categories with a 15-color preset picker
- **Recurring Transactions** — Define weekly or monthly rules that auto-generate transactions on app load; pause and resume at any time
- **Reports** — Monthly and weekly bar charts comparing income vs. expenses, category breakdown table with percentages and visual progress bars, navigate between periods
- **CSV Import / Export** — Export all transactions as `.csv`; import from `.csv` with column validation and a preview screen before confirming
- **Dark Mode** — Toggle from the sidebar; full light/dark design system using CSS custom properties

## Tech Stack

| Layer       | Technology                       |
| ----------- | -------------------------------- |
| Framework   | Next.js 16 (App Router)         |
| Language    | TypeScript (strict mode)         |
| Styling     | Tailwind CSS 4                   |
| Charts      | Recharts 3                       |
| Icons       | Lucide React                     |
| Dates       | date-fns 4                       |
| Storage     | Browser localStorage             |

All UI components (Button, Modal, Input, Card, Badge, etc.) are built from scratch with Tailwind — no external component libraries.

## Getting Started

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — the app redirects to the Dashboard.

## Available Scripts

| Command         | Description                    |
| --------------- | ------------------------------ |
| `npm run dev`   | Start development server       |
| `npm run build` | Create production build        |
| `npm run start` | Serve production build         |
| `npm run lint`  | Run ESLint                     |

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── dashboard/              # Summary cards, charts, recent transactions
│   ├── transactions/           # Transaction list, CRUD, CSV import/export
│   ├── categories/             # Category management with color picker
│   ├── recurring/              # Recurring rule management
│   ├── reports/                # Period reports with bar charts and tables
│   ├── layout.tsx              # Root layout (Inter + Space Grotesk fonts)
│   ├── globals.css             # Design system ("Obsidian Finance" theme)
│   └── ClientLayout.tsx        # Client wrapper with context provider
├── components/
│   ├── charts/                 # IncomeExpenseChart, CategoryPieChart, ReportBarChart
│   ├── layout/                 # Sidebar, Header, PageWrapper, AppShell
│   └── ui/                     # Button, Modal, Input, Select, Card, Badge, EmptyState
├── hooks/
│   ├── useFinanceStore.ts      # Core data layer — localStorage CRUD + seed data
│   └── FinanceContext.tsx       # React context provider for global state
├── lib/
│   ├── csv.ts                  # CSV parsing, validation, export, and file download
│   └── utils.ts                # formatCurrency, parseCurrencyToCents, cn, generateId
└── types/
    └── finance.ts              # All TypeScript interfaces and type definitions
```

## Data Layer

State is managed through a custom `useFinanceStore` hook exposed via React context. All data is stored under a single localStorage key (`finance_app_data`) as JSON.

**Monetary values** are stored as integers in cents (e.g., `$55.00` → `5500`) to avoid floating-point precision issues.

On first load, the app seeds 15 sample transactions across 2 months with a mix of income and expenses across the default categories.

## Design System

The **"Obsidian Finance"** theme uses a warm neutral palette with an emerald accent:

- **Fonts** — Space Grotesk for headings, Inter for body text
- **Light mode** — Warm off-white backgrounds (`#faf9f7`), dark charcoal sidebar (`#1a1a1a`)
- **Dark mode** — Deep black backgrounds (`#111111`), muted warm text
- **Semantic colors** — Green (`#059669`) for income, red (`#dc2626`) for expenses
- **Animations** — Fade-in page transitions, staggered card animations, button press effects
