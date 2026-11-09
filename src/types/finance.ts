export type TransactionType = "income" | "expense";
export type CategoryType = TransactionType;

export interface User {
  id: number;
  full_name: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  type: CategoryType;
}

export interface Transaction {
  id: number;
  user_id: number;
  category_id: number;
  type: TransactionType;
  amount: string;
  description: string;
  transaction_date: string;
  created_at: string;
}

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  amount: string;
  month: string;
  created_at: string;
}

export interface BudgetProgress {
  budget_id: number;
  category_id: number;
  category: string;
  allocated: string;
  spent: string;
  remaining: string;
  percentage: number;
  status: "normal" | "approaching" | "exceeded";
}

export interface DashboardSummary {
  total_balance: string;
  monthly_income: string;
  monthly_expenses: string;
  monthly_budget: string;
  recent_transactions: Transaction[];
  budget_progress: BudgetProgress[];
}

export interface TransactionInput {
  type: TransactionType;
  category_id: number;
  amount: string;
  description: string;
  transaction_date: string;
}

export interface BudgetInput {
  category_id: number;
  amount: string;
  month: string;
}
