"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BudgetForm } from "@/components/budgets/budget-form";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useFinanceStore } from "@/hooks/use-finance-store";
import { formatNaira } from "@/lib/calculations";
import { getUserInitials } from "@/lib/user";
import { logoutAccount } from "@/services/auth-service";
import type { Budget, BudgetInput } from "@/types/finance";
import styles from "../dashboard/page.module.css";

const selectedMonth = "2026-11";
const budgetColors = ["mint", "blue", "coral"] as const;

export default function BudgetsPage() {
  const [isFormOpen, setFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);
  const {
    user,
    categories,
    budgets,
    summary,
    addBudget,
    updateBudget,
    deleteBudget,
  } = useFinanceStore(selectedMonth);

  async function handleSubmit(input: BudgetInput) {
    if (editingBudget) {
      await updateBudget(editingBudget.id, input);
      toast.success("Budget updated.");
    } else {
      await addBudget(input);
      toast.success("Budget created.");
    }
    setEditingBudget(null);
    setFormOpen(false);
  }

  function handleDelete(budget: Budget) {
    setBudgetToDelete(budget);
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
          <Link href="/transactions">
            <span>↕</span>Transactions
          </Link>
          <Link className={styles.activeNav} href="/budgets">
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
            <p className={styles.eyebrow}>November overview</p>
            <h1>Budgets</h1>
            <p className={styles.subtitle}>
              Set limits that keep your spending intentional.
            </p>
          </div>
          <button
            className={styles.textButton}
            type="button"
            onClick={() => {
              setEditingBudget(null);
              setFormOpen(true);
            }}
          >
            Create a budget <span>＋</span>
          </button>
        </header>
        <section className={styles.panel}>
          <div className={styles.budgetList}>
            {summary.budget_progress.length === 0 ? (
              <p className={styles.emptyState}>
                No budgets have been created for this month.
              </p>
            ) : (
              summary.budget_progress.map((budget, index) => {
                const existingBudget = budgets.find(
                  (item) => item.id === budget.budget_id,
                );
                return (
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
                            if (existingBudget) {
                              setEditingBudget(existingBudget);
                              setFormOpen(false);
                            }
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (existingBudget) handleDelete(existingBudget);
                          }}
                        >
                          Delete
                        </button>
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </main>
      {(isFormOpen || editingBudget) && (
        <BudgetForm
          key={editingBudget?.id ?? "new-budget"}
          categories={categories}
          initialBudget={editingBudget ?? undefined}
          onSubmit={handleSubmit}
          onClose={() => {
            setEditingBudget(null);
            setFormOpen(false);
          }}
        />
      )}
      {budgetToDelete && (
        <ConfirmDialog
          title="Delete budget?"
          message="Are you sure you want to delete this budget? This action cannot be undone."
          onClose={() => setBudgetToDelete(null)}
          onConfirm={async () => {
            await deleteBudget(budgetToDelete.id);
            toast.success("Budget deleted.");
            setBudgetToDelete(null);
          }}
        />
      )}
    </div>
  );
}
