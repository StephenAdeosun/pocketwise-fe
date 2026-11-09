# Student Budget and Expense Tracker

## Purpose

A web application for university students to record income, track expenses, create monthly category budgets, and understand their remaining balance.

## MVP Scope

- Student registration, login, and logout
- Income and expense transaction CRUD
- Monthly category budgets
- Dashboard financial summary
- Transaction filtering by type, category, and month
- Budget warnings at 80% and above 100%
- NGN as the initial currency
- Private user-owned financial records

## Domain Rules

- Transaction types are `income` and `expense`.
- Total balance equals all income minus all expenses.
- Monthly income and expenses are sums for the selected `YYYY-MM` month.
- Budget spent equals expenses for the budget category in the budget month.
- Remaining budget equals budget amount minus budget spent.
- Below 80% is normal; 80%-100% is approaching; above 100% is exceeded.
- Amounts must be positive and processed without unnecessary floating-point errors.
- Dates use `YYYY-MM-DD`; budget months use `YYYY-MM`.

## Required API Areas

- Authentication: register, login, current user
- Categories: list default categories
- Transactions: list, create, retrieve, update, delete, filter
- Budgets: list, create, update, delete
- Dashboard: monthly financial summary

## Security

Passwords must be hashed. Protected requests use JWT Bearer tokens. Every transaction and budget query or mutation must be scoped to the authenticated user.

## Exclusions

No bank integrations, payments, AI advice, savings goals, recurring transactions, multiple currencies, exports, admin dashboard, social features, or notifications in the MVP.
