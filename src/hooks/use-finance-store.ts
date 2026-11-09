"use client";

import { useEffect, useState } from "react";
import {
  createBudget,
  createTransaction,
  deleteBudget as deleteBudgetRequest,
  deleteTransaction as deleteTransactionRequest,
  getBudgets,
  getCategories,
  getCurrentUser,
  getDashboardSummary,
  getTransactions,
  updateBudget as updateBudgetRequest,
  updateTransaction as updateTransactionRequest,
} from "@/services/api-client";
import type {
  Budget,
  BudgetInput,
  Category,
  DashboardSummary,
  Transaction,
  TransactionInput,
  User,
} from "@/types/finance";

interface FinanceState {
  user: User;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  summary: DashboardSummary;
}

async function fetchFinanceState(month: string): Promise<FinanceState> {
  const [user, categories, transactions, budgets, summary] = await Promise.all([
    getCurrentUser(),
    getCategories(),
    getTransactions(),
    getBudgets(),
    getDashboardSummary(month),
  ]);
  return { user, categories, transactions, budgets, summary };
}

const emptySummary: DashboardSummary = {
  total_balance: "0.00",
  monthly_income: "0.00",
  monthly_expenses: "0.00",
  monthly_budget: "0.00",
  recent_transactions: [],
  budget_progress: [],
};

const emptyState: FinanceState = {
  user: { id: 0, full_name: "", email: "" },
  categories: [],
  transactions: [],
  budgets: [],
  summary: emptySummary,
};

export function useFinanceStore(month: string): {
  user: User;
  categories: Category[];
  transactions: Transaction[];
  budgets: Budget[];
  summary: DashboardSummary;
  addTransaction: (input: TransactionInput) => Promise<void>;
  updateTransaction: (id: number, input: TransactionInput) => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
  addBudget: (input: BudgetInput) => Promise<void>;
  updateBudget: (id: number, input: BudgetInput) => Promise<void>;
  deleteBudget: (id: number) => Promise<void>;
} {
  const [state, setState] = useState<FinanceState>(emptyState);

  async function refresh() {
    setState(await fetchFinanceState(month));
  }

  useEffect(() => {
    void fetchFinanceState(month).then(setState);
  }, [month]);

  async function addTransaction(input: TransactionInput) {
    await createTransaction(input);
    await refresh();
  }

  async function updateTransaction(id: number, input: TransactionInput) {
    await updateTransactionRequest(id, input);
    await refresh();
  }

  async function deleteTransaction(id: number) {
    await deleteTransactionRequest(id);
    await refresh();
  }

  async function addBudget(input: BudgetInput) {
    await createBudget(input);
    await refresh();
  }

  async function updateBudget(id: number, input: BudgetInput) {
    await updateBudgetRequest(id, input);
    await refresh();
  }

  async function deleteBudget(id: number) {
    await deleteBudgetRequest(id);
    await refresh();
  }

  return {
    user: state.user,
    categories: state.categories,
    transactions: state.transactions,
    budgets: state.budgets,
    summary: state.summary,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
  };
}
