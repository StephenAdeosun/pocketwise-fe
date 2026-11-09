import type { BudgetInput, TransactionInput } from "@/types/finance";

const amountPattern = /^\d+(\.\d{1,2})?$/;
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const monthPattern = /^\d{4}-\d{2}$/;
const strongPasswordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

export function validatePassword(password: string): string[] {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters.");
  }
  if (!strongPasswordPattern.test(password)) {
    errors.push("Use uppercase, lowercase, a number, and a special character.");
  }

  return errors;
}

export function validateTransaction(input: TransactionInput): string[] {
  const errors: string[] = [];

  if (!amountPattern.test(input.amount.trim()) || Number(input.amount) <= 0) {
    errors.push("Amount must be greater than zero.");
  }
  if (!input.category_id) {
    errors.push("Select a source or category.");
  }
  if (!datePattern.test(input.transaction_date)) {
    errors.push("Enter a valid transaction date.");
  }
  if (!input.type) {
    errors.push("Select a transaction type.");
  }

  return errors;
}

export function validateBudget(input: BudgetInput): string[] {
  const errors: string[] = [];

  if (!amountPattern.test(input.amount.trim()) || Number(input.amount) <= 0) {
    errors.push("Budget amount must be greater than zero.");
  }
  if (!input.category_id) {
    errors.push("Select an expense category.");
  }
  if (!monthPattern.test(input.month)) {
    errors.push("Enter a valid budget month.");
  }

  return errors;
}
