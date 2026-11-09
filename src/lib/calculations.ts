import type {
  Budget,
  BudgetProgress,
  Category,
  DashboardSummary,
  Transaction,
} from "@/types/finance";

const amountPattern = /^\d+(\.\d{1,2})?$/;

export function amountToCents(amount: string): number {
  if (!amountPattern.test(amount.trim())) {
    return 0;
  }

  const [whole, fraction = ""] = amount.trim().split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function centsToAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function sumAmounts(amounts: string[]): string {
  return centsToAmount(
    amounts.reduce((total, amount) => total + amountToCents(amount), 0),
  );
}

export function formatNaira(amount: string): string {
  return `₦${Number(amount).toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function monthFromDate(date: string): string {
  return date.slice(0, 7);
}

export function getBudgetStatus(
  spent: string,
  allocated: string,
): BudgetProgress["status"] {
  const allocatedCents = amountToCents(allocated);
  const spentCents = amountToCents(spent);

  if (allocatedCents === 0 || spentCents > allocatedCents) {
    return spentCents > allocatedCents ? "exceeded" : "normal";
  }

  return spentCents / allocatedCents >= 0.8 ? "approaching" : "normal";
}

export function getBudgetProgress(
  budget: Budget,
  transactions: Transaction[],
  categories: Category[],
): BudgetProgress {
  const category = categories.find((item) => item.id === budget.category_id);
  const matchingExpenses = transactions.filter(
    (transaction) =>
      transaction.type === "expense" &&
      transaction.category_id === budget.category_id &&
      monthFromDate(transaction.transaction_date) === budget.month,
  );
  const spent = sumAmounts(
    matchingExpenses.map((transaction) => transaction.amount),
  );
  const allocatedCents = amountToCents(budget.amount);
  const spentCents = amountToCents(spent);
  const percentage =
    allocatedCents === 0 ? 0 : Math.round((spentCents / allocatedCents) * 100);

  return {
    budget_id: budget.id,
    category_id: budget.category_id,
    category: category?.name ?? "Unknown category",
    allocated: budget.amount,
    spent,
    remaining: centsToAmount(Math.max(allocatedCents - spentCents, 0)),
    percentage,
    status: getBudgetStatus(spent, budget.amount),
  };
}

export function getDashboardSummary(
  transactions: Transaction[],
  budgets: Budget[],
  categories: Category[],
  month: string,
): DashboardSummary {
  const monthlyTransactions = transactions.filter(
    (transaction) => monthFromDate(transaction.transaction_date) === month,
  );
  const income = monthlyTransactions.filter(
    (transaction) => transaction.type === "income",
  );
  const expenses = monthlyTransactions.filter(
    (transaction) => transaction.type === "expense",
  );
  const budgetProgress = budgets
    .filter((budget) => budget.month === month)
    .map((budget) => getBudgetProgress(budget, transactions, categories));

  return {
    total_balance: sumAmounts(
      transactions.map((transaction) =>
        transaction.type === "income"
          ? transaction.amount
          : `-${transaction.amount}`,
      ),
    ),
    monthly_income: sumAmounts(income.map((transaction) => transaction.amount)),
    monthly_expenses: sumAmounts(
      expenses.map((transaction) => transaction.amount),
    ),
    monthly_budget: sumAmounts(
      budgetProgress.map((budget) => budget.allocated),
    ),
    recent_transactions: [...monthlyTransactions]
      .sort((left, right) =>
        right.transaction_date.localeCompare(left.transaction_date),
      )
      .slice(0, 5),
    budget_progress: budgetProgress,
  };
}
