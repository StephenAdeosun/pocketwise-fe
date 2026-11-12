"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useFinanceStore } from "@/hooks/use-finance-store";
import { formatDate, formatNaira } from "@/lib/calculations";
import { getUserInitials } from "@/lib/user";
import { logoutAccount } from "@/services/auth-service";
import type {
  Transaction,
  TransactionInput,
  TransactionType,
} from "@/types/finance";
import styles from "../dashboard/page.module.css";

const selectedMonth = "2026-11";

export default function TransactionsPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<"all" | TransactionType>("all");
  const [categoryFilter, setCategoryFilter] = useState(0);
  const [monthFilter, setMonthFilter] = useState(selectedMonth);
  const {
    user,
    categories,
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useFinanceStore(selectedMonth);

  const filteredTransactions = transactions
    .filter(
      (transaction) => typeFilter === "all" || transaction.type === typeFilter,
    )
    .filter(
      (transaction) =>
        categoryFilter === 0 || transaction.category_id === categoryFilter,
    )
    .filter((transaction) =>
      transaction.transaction_date.startsWith(monthFilter),
    );

  async function handleSubmit(input: TransactionInput) {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, input);
      toast.success("Transaction updated.");
    } else {
      await addTransaction(input);
      toast.success(input.type === "income" ? "Income added." : "Expense added.");
    }
    setEditingTransaction(null);
    setFormOpen(false);
  }

  function handleDelete(transaction: Transaction) {
    setTransactionToDelete(transaction);
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
          <Link href="/dashboard">
            <span>▦</span>Dashboard
          </Link>
          <Link className={styles.activeNav} href="/transactions">
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
          <Link className={styles.logout} href="/login" onClick={logoutAccount}>
            ↪ <span>Log out</span>
          </Link>
        </div>
      </aside>
      <main className={styles.content}>
        <header className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Your activity</p>
            <h1>Transactions</h1>
            <p className={styles.subtitle}>
              Review every income and expense in one place.
            </p>
          </div>
          <button
            className={styles.textButton}
            type="button"
            onClick={() => {
              setEditingTransaction(null);
              setFormOpen(true);
            }}
          >
            Add transaction <span>＋</span>
          </button>
        </header>
        <section className={styles.panel}>
          <div
            className={styles.transactionFilters}
            aria-label="Transaction filters"
          >
            <select
              aria-label="Filter by transaction type"
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(event.target.value as "all" | TransactionType)
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
                          (category) => category.id === transaction.category_id,
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
                      onClick={() => {
                        setEditingTransaction(transaction);
                        setFormOpen(false);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(transaction)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
      {(isFormOpen || editingTransaction) && (
        <TransactionForm
          key={editingTransaction?.id ?? "new"}
          categories={categories}
          initialTransaction={editingTransaction ?? undefined}
          onSubmit={handleSubmit}
          onClose={() => {
            setEditingTransaction(null);
            setFormOpen(false);
          }}
        />
      )}
      {transactionToDelete && (
        <ConfirmDialog
          title="Delete transaction?"
          message={`Are you sure you want to delete "${transactionToDelete.description}"? This action cannot be undone.`}
          onClose={() => setTransactionToDelete(null)}
          onConfirm={async () => {
            await deleteTransaction(transactionToDelete.id);
            toast.success("Transaction deleted.");
            setTransactionToDelete(null);
          }}
        />
      )}
    </div>
  );
}
