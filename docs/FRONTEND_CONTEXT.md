# Frontend Context

The frontend is a Next.js 16 App Router application using React, TypeScript, and CSS modules.

Important contract files:

- `src/types/finance.ts`: shared transaction, budget, category, user, and dashboard shapes.
- `src/data/demo-data.ts`: default category IDs and demo record shapes.
- `src/lib/calculations.ts`: reference calculation rules for balance, monthly totals, budget usage, and thresholds.
- `src/lib/validation.ts`: client validation rules.
- `src/hooks/use-finance-store.ts`: current localStorage mock adapter and CRUD interface.
- `src/components/transactions/transaction-form.tsx`: transaction payload fields.
- `src/components/budgets/budget-form.tsx`: budget payload fields.
- `src/app/page.tsx`, `src/app/transactions/page.tsx`, and `src/app/budgets/page.tsx`: current consumers.

The backend must preserve the frontend field names. The current mock layer uses income/expense, decimal-string amounts, ISO dates, YYYY-MM months, and NGN. The backend becomes the final authority for totals when integration begins.
