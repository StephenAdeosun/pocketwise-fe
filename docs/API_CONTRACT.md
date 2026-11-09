# API Contract

Base URL during development: `http://localhost:8000/api`

All requests and responses use JSON. Protected requests use `Authorization: Bearer ACCESS_TOKEN`.

## Authentication

- `POST /auth/register` accepts `full_name`, `email`, `password`, and `password_confirmation`.
- `POST /auth/login` accepts `email` and `password`, and returns an access token and user.
- `GET /auth/me` returns the authenticated user.

## Categories

- `GET /categories` returns categories with `id`, `name`, and `type`.
- Category types are `income` and `expense`.

## Transactions

- `GET /transactions` supports `type`, `category_id`, and `month` filters.
- `POST /transactions` accepts `type`, `category_id`, `amount`, `description`, and `transaction_date`.
- `GET /transactions/{id}`, `PUT /transactions/{id}`, and `DELETE /transactions/{id}` are user-scoped.
- Amounts are decimal strings such as `"2000.00"`.
- Dates use `YYYY-MM-DD`.

## Budgets

- `GET /budgets` lists the authenticated user's budgets.
- `POST /budgets` accepts `category_id`, `amount`, and `month`.
- `PUT /budgets/{id}` and `DELETE /budgets/{id}` are user-scoped.
- Amounts are decimal strings and months use `YYYY-MM`.
- Duplicate `(user_id, category_id, month)` budgets return HTTP 409.

## Dashboard

- `GET /dashboard/summary?month=YYYY-MM` returns:
  - `total_balance`
  - `monthly_income`
  - `monthly_expenses`
  - `monthly_budget`
  - `recent_transactions`
  - `budget_progress`

Budget progress includes `budget_id`, `category_id`, `category`, `allocated`, `spent`, `remaining`, `percentage`, and `status`.
