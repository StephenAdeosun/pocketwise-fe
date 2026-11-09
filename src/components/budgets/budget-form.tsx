"use client";

import { useState } from "react";
import { validateBudget } from "@/lib/validation";
import type { Budget, BudgetInput, Category } from "@/types/finance";
import styles from "@/app/page.module.css";

interface BudgetFormProps {
  categories: Category[];
  onSubmit: (input: BudgetInput) => void | Promise<void>;
  onClose: () => void;
  initialBudget?: Budget;
}

const initialForm: BudgetInput = {
  category_id: 6,
  amount: "",
  month: "2026-11",
};

export function BudgetForm({
  categories,
  onSubmit,
  onClose,
  initialBudget,
}: BudgetFormProps) {
  const [form, setForm] = useState<BudgetInput>(() =>
    initialBudget
      ? {
          category_id: initialBudget.category_id,
          amount: initialBudget.amount,
          month: initialBudget.month,
        }
      : initialForm,
  );
  const [errors, setErrors] = useState<string[]>([]);
  const expenseCategories = categories.filter(
    (category) => category.type === "expense",
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateBudget(form);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit({ ...form, amount: Number(form.amount).toFixed(2) });
      onClose();
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "Unable to save this budget.",
      ]);
    }
  }

  return (
    <div
      className={styles.modalBackdrop}
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="budget-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>Monthly plan</p>
            <h2 id="budget-form-title">
              {initialBudget ? "Edit budget" : "Create a budget"}
            </h2>
          </div>
          <button
            className={styles.closeButton}
            type="button"
            onClick={onClose}
            aria-label="Close form"
          >
            ×
          </button>
        </div>

        {errors.length > 0 && (
          <div className={styles.formErrors} role="alert">
            {errors.map((error) => (
              <p key={error}>{error}</p>
            ))}
          </div>
        )}

        <form className={styles.transactionForm} onSubmit={handleSubmit}>
          <label>
            Expense category
            <select
              value={form.category_id}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  category_id: Number(event.target.value),
                }))
              }
            >
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Budget amount
            <div className={styles.amountInput}>
              <span>₦</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    amount: event.target.value,
                  }))
                }
                placeholder="0.00"
                required
              />
            </div>
          </label>
          <label>
            Month
            <input
              type="month"
              value={form.month}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  month: event.target.value,
                }))
              }
              required
            />
          </label>
          <div className={styles.formActions}>
            <button
              className={styles.cancelButton}
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className={styles.primaryButton} type="submit">
              {initialBudget ? "Save changes" : "Save budget"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
