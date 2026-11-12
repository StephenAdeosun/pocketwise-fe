"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BudgetForm } from "@/components/budgets/budget-form";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import {
  formatDate,
  formatNaira,
  amountToCents,
  centsToAmount,
} from "@/lib/calculations";
import { useFinanceStore } from "@/hooks/use-finance-store";
import { logoutAccount } from "@/services/auth-service";
import { getCurrentUser, hasAccessToken } from "@/services/api-client";
import { getUserInitials } from "@/lib/user";
import type {
  Budget,
  BudgetInput,
  Transaction,
  TransactionInput,
  TransactionType,
} from "@/types/finance";
import styles from "./page.module.css";

const budgetColors = ["mint", "blue", "coral"] as const;

function getCurrentDateDetails() {
  const now = new Date();
  return {
    month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
    label: new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(now),
    greeting:
      now.getHours() < 12
        ? "Good morning"
        : now.getHours() < 18
          ? "Good afternoon"
          : "Good evening",
  };
}

function DashboardContent() {
  const { month: selectedMonth, label: currentDate, greeting } =
    getCurrentDateDetails();
  const [isTransactionFormOpen, setTransactionFormOpen] = useState(false);
  const [isBudgetFormOpen, setBudgetFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<
    | { type: "transaction"; item: Transaction }
    | { type: "budget"; item: Budget }
    | null
  >(null);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<
    "all" | TransactionType
  >("all");
  const [categoryFilter, setCategoryFilter] = useState(0);
  const [monthFilter, setMonthFilter] = useState(selectedMonth);
  const {
    user,
    categories,
    transactions,
    budgets,
    summary,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
  } = useFinanceStore(selectedMonth);
  const firstName = user.full_name.split(" ")[0];
  const remainingBudget = centsToAmount(
    Math.max(
      amountToCents(summary.monthly_budget) -
        amountToCents(summary.monthly_expenses),
      0,
    ),
  );
  const balanceCents = amountToCents(summary.total_balance);
  const balanceTone =
    balanceCents <= 0
      ? styles.negativeBalance
      : balanceCents < 1000000
        ? styles.lowBalance
        : styles.healthyBalance;

  const filteredTransactions = transactions
    .filter(
      (transaction) =>
        transactionTypeFilter === "all" ||
        transaction.type === transactionTypeFilter,
    )
    .filter(
      (transaction) =>
        categoryFilter === 0 || transaction.category_id === categoryFilter,
    )
    .filter((transaction) =>
      transaction.transaction_date.startsWith(monthFilter),
    );

  async function handleTransactionSubmit(input: TransactionInput) {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, input);
      toast.success("Transaction updated.");
    } else {
      await addTransaction(input);
      toast.success(input.type === "income" ? "Income added." : "Expense added.");
    }
    setEditingTransaction(null);
    setTransactionFormOpen(false);
  }

  function handleEditTransaction(transaction: Transaction) {
    setEditingTransaction(transaction);
    setTransactionFormOpen(false);
  }

  function handleDeleteTransaction(transaction: Transaction) {
    setDeleteTarget({ type: "transaction", item: transaction });
  }

  async function handleBudgetSubmit(input: BudgetInput) {
    if (editingBudget) {
      await updateBudget(editingBudget.id, input);
      toast.success("Budget updated.");
    } else {
      await addBudget(input);
      toast.success("Budget created.");
    }
    setEditingBudget(null);
    setBudgetFormOpen(false);
  }

  function handleDeleteBudget(budget: Budget) {
    setDeleteTarget({ type: "budget", item: budget });
  }

  return (
    <div className={styles.appShell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>₦</span>
          <span>pocketwise</span>
        </div>
        <div className={styles.profile}>
          <div className={styles.avatar}>{getUserInitials(user.full_name)}</div>
          <div>
            <strong>{user.full_name}</strong>
            <span>Student account</span>
          </div>
        </div>
        <nav className={styles.nav} aria-label="Main navigation">
          <Link className={styles.activeNav} href="/dashboard">
            <span>▦</span>Dashboard
          </Link>
          <Link href="/transactions">
            <span>↕</span>Transactions
          </Link>
          <Link href="/budgets">
            <span>◫</span>Budgets
          </Link>
        </nav>
        <div className={styles.sidebarBottom}>
          <div className={styles.tip}>
            <span>✦</span>
            <strong>Small steps add up.</strong>
            <p>Keeping track today makes tomorrow easier.</p>
          </div>
          <a
            className={styles.logout}
            href="/login"
            onClick={() => logoutAccount()}
          >
            ↪ <span>Log out</span>
          </a>
        </div>
      </aside>

      <main className={styles.content} id="dashboard">
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>{currentDate}</p>
            <h1>{greeting}, {firstName}</h1>
            <p className={styles.subtitle}>
              Here is how your money is looking this month.
            </p>
          </div>
          <button
            className={styles.notification}
            aria-label="View notifications"
          >
            ♢<span className={styles.notificationDot} />
          </button>
        </header>

        <section className={styles.summaryGrid} aria-label="Financial summary">
          <article
            className={`${styles.summaryCard} ${styles.balanceCard} ${balanceTone}`}
          >
            <div className={styles.cardLabel}>
              Total balance <span>i</span>
            </div>
            <strong>{formatNaira(summary.total_balance)}</strong>
            <p className={styles.positive}>
              ↑ 12.5% <span>vs last month</span>
            </p>
            <div className={styles.balanceLine}>
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
          </article>
          <article className={styles.summaryCard}>
            <div className={styles.cardLabel}>
              November income <span>↗</span>
            </div>
            <strong>{formatNaira(summary.monthly_income)}</strong>
            <p className={styles.muted}>
              {
                summary.recent_transactions.filter(
                  (transaction) => transaction.type === "income",
                ).length
              }{" "}
              income transactions
            </p>
          </article>
          <article className={styles.summaryCard}>
            <div className={styles.cardLabel}>
              November expenses <span>↘</span>
            </div>
            <strong>{formatNaira(summary.monthly_expenses)}</strong>
            <p className={styles.muted}>
              {summary.monthly_income === "0.00"
                ? "No income recorded"
                : `${Math.round((amountToCents(summary.monthly_expenses) / amountToCents(summary.monthly_income)) * 100)}% of your income`}
            </p>
          </article>
          <article className={`${styles.summaryCard} ${styles.budgetCard}`}>
            <div className={styles.cardLabel}>
              Monthly budget <span>⌁</span>
            </div>
            <strong>{formatNaira(summary.monthly_budget)}</strong>
            <div className={styles.budgetBar}>
              <i />
            </div>
            <p className={styles.muted}>
              {formatNaira(remainingBudget)} remaining
            </p>
          </article>
        </section>

        <div className={styles.sectionGrid}>
          <section className={styles.panel} id="transactions">
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.eyebrow}>Your activity</p>
                <h2>Transactions</h2>
              </div>
              <button
                className={styles.textButton}
                type="button"
                onClick={() => {
                  setEditingTransaction(null);
                  setTransactionFormOpen(true);
                }}
              >
                Add transaction <span>＋</span>
              </button>
            </div>
            <div
              className={styles.transactionFilters}
              aria-label="Transaction filters"
            >
              <select
                aria-label="Filter by transaction type"
                value={transactionTypeFilter}
                onChange={(event) =>
                  setTransactionTypeFilter(
                    event.target.value as "all" | TransactionType,
                  )
                }
              >
                <option value="all">All types</option>
                <option value="income">Income</option>
                <option value="expense">Expenses</option>
              </select>
              <select
                aria-label="Filter by category"
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(Number(event.target.value))
                }
              >
                <option value={0}>All categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <input
                aria-label="Filter by month"
                type="month"
                value={monthFilter}
                onChange={(event) => setMonthFilter(event.target.value)}
              />
            </div>
            <div className={styles.transactionList}>
              {filteredTransactions.length === 0 ? (
                <p className={styles.emptyState}>
                  No transactions match these filters.
                </p>
              ) : (
                filteredTransactions.map((transaction) => (
                  <div className={styles.transaction} key={transaction.id}>
                    <div
                      className={`${styles.transactionIcon} ${transaction.type === "income" ? styles.incomeIcon : ""}`}
                    >
                      {transaction.type === "income" ? "↗" : "↘"}
                    </div>
                    <div className={styles.transactionInfo}>
                      <strong>{transaction.description}</strong>
                      <span>
                        {
                          categories.find(
                            (category) =>
                              category.id === transaction.category_id,
                          )?.name
                        }{" "}
                        · {formatDate(transaction.transaction_date)}
                      </span>
                    </div>
                    <strong
                      className={
                        transaction.type === "income"
                          ? styles.incomeAmount
                          : styles.expenseAmount
                      }
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatNaira(transaction.amount)}
                    </strong>
                    <div className={styles.transactionActions}>
                      <button
                        type="button"
                        aria-label={`Edit ${transaction.description}`}
                        onClick={() => handleEditTransaction(transaction)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        aria-label={`Delete ${transaction.description}`}
                        onClick={() => handleDeleteTransaction(transaction)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className={styles.panel} id="budgets">
            <div className={styles.panelHeader}>
              <div>
                <p className={styles.eyebrow}>November overview</p>
                <h2>Budget progress</h2>
              </div>
              <a className={styles.textLink} href="#all-budgets">
                Manage <span>→</span>
              </a>
            </div>
            <div className={styles.budgetList}>
              {summary.budget_progress.length === 0 ? (
                <p className={styles.emptyState}>
                  No budgets have been created for this month.
                </p>
              ) : (
                summary.budget_progress.map((budget, index) => (
                  <div className={styles.budgetItem} key={budget.budget_id}>
                    <div className={styles.budgetHeading}>
                      <strong>{budget.category}</strong>
                      <span>
                        {formatNaira(budget.spent)}{" "}
                        <em>/ {formatNaira(budget.allocated)}</em>
                      </span>
                    </div>
                    <div className={styles.progressTrack}>
                      <i
                        className={
                          styles[budgetColors[index % budgetColors.length]]
                        }
                        style={{
                          width: `${Math.min(budget.percentage, 100)}%`,
                        }}
                      />
                    </div>
                    <div className={styles.budgetMeta}>
                      <span>{budget.percentage}% used</span>
                      <span>
                        {budget.status === "exceeded"
                          ? "Budget exceeded"
                          : budget.status === "approaching"
                            ? "Approaching limit"
                            : "On track"}
                      </span>
                      <span className={styles.budgetActions}>
                        <button
                          type="button"
                          onClick={() => {
                            const existingBudget = budgets.find(
                              (item) => item.id === budget.budget_id,
                            );
                            if (existingBudget) {
                              setEditingBudget(existingBudget);
                              setBudgetFormOpen(false);
                            }
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const existingBudget = budgets.find(
                              (item) => item.id === budget.budget_id,
                            );
                            if (existingBudget)
                              handleDeleteBudget(existingBudget);
                          }}
                        >
                          Delete
                        </button>
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              className={styles.outlineButton}
              type="button"
              onClick={() => {
                setEditingBudget(null);
                setBudgetFormOpen(true);
              }}
            >
              + Create a budget
            </button>
          </section>
        </div>
      </main>
      {(isTransactionFormOpen || editingTransaction) && (
        <TransactionForm
          key={editingTransaction?.id ?? "new"}
          categories={categories}
          initialTransaction={editingTransaction ?? undefined}
          onSubmit={handleTransactionSubmit}
          onClose={() => {
            setEditingTransaction(null);
            setTransactionFormOpen(false);
          }}
        />
      )}
      {(isBudgetFormOpen || editingBudget) && (
        <BudgetForm
          key={editingBudget?.id ?? "new-budget"}
          categories={categories}
          initialBudget={editingBudget ?? undefined}
          onSubmit={handleBudgetSubmit}
          onClose={() => {
            setEditingBudget(null);
            setBudgetFormOpen(false);
          }}
        />
      )}
      {deleteTarget && (
        <ConfirmDialog
          title={`Delete ${deleteTarget.type}?`}
          message={
            deleteTarget.type === "transaction"
              ? `Are you sure you want to delete "${deleteTarget.item.description}"? This action cannot be undone.`
              : "Are you sure you want to delete this budget? This action cannot be undone."
          }
          onClose={() => setDeleteTarget(null)}
          onConfirm={async () => {
            if (deleteTarget.type === "transaction") {
              await deleteTransaction(deleteTarget.item.id);
              toast.success("Transaction deleted.");
            } else {
              await deleteBudget(deleteTarget.item.id);
              toast.success("Budget deleted.");
            }
            setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    if (!hasAccessToken()) {
      router.replace("/auth/login");
      return;
    }

    void getCurrentUser()
      .then(() => setCheckingAuth(false))
      .catch(() => {
        router.replace("/auth/login");
      });
  }, [router]);

  if (checkingAuth) {
    return (
      <main className={styles.authLoading} aria-label="Loading dashboard">
        <span className={styles.spinner} />
      </main>
    );
  }

  return <DashboardContent />;
}
