"use client";

import { useState } from "react";
import { validateTransaction } from "@/lib/validation";
import type { Category, Transaction, TransactionInput } from "@/types/finance";
import styles from "@/app/page.module.css";

interface TransactionFormProps {
  categories: Category[];
  onSubmit: (input: TransactionInput) => void | Promise<void>;
  onClose: () => void;
  initialTransaction?: Transaction;
}

const initialForm: TransactionInput = {
  type: "expense",
  category_id: 6,
  amount: "",
  description: "",
  transaction_date: "2026-11-07",
};

export function TransactionForm({
  categories,
  onSubmit,
  onClose,
  initialTransaction,
}: TransactionFormProps) {
  const [form, setForm] = useState<TransactionInput>(() =>
    initialTransaction
      ? {
          type: initialTransaction.type,
          category_id: initialTransaction.category_id,
          amount: initialTransaction.amount,
          description: initialTransaction.description,
          transaction_date: initialTransaction.transaction_date,
        }
      : initialForm,
  );
  const [errors, setErrors] = useState<string[]>([]);

  const availableCategories = categories.filter(
    (category) => category.type === form.type,
  );

  function updateField<Key extends keyof TransactionInput>(
    key: Key,
    value: TransactionInput[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors([]);
  }

  function handleTypeChange(type: TransactionInput["type"]) {
    const firstCategory = categories.find((category) => category.type === type);
    setForm((current) => ({
      ...current,
      type,
      category_id: firstCategory?.id ?? 0,
    }));
    setErrors([]);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationErrors = validateTransaction(form);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      await onSubmit({ ...form, amount: Number(form.amount).toFixed(2) });
      onClose();
    } catch (error) {
      setErrors([
        error instanceof Error ? error.message : "Unable to save transaction.",
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
        aria-labelledby="transaction-form-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <div>
            <p className={styles.eyebrow}>New record</p>
            <h2 id="transaction-form-title">
              {initialTransaction ? "Edit transaction" : "Add transaction"}
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
          <div
            className={styles.formToggle}
            role="group"
            aria-label="Transaction type"
          >
            <button
              className={form.type === "expense" ? styles.selectedToggle : ""}
              type="button"
              onClick={() => handleTypeChange("expense")}
            >
              Expense
            </button>
            <button
              className={form.type === "income" ? styles.selectedToggle : ""}
              type="button"
              onClick={() => handleTypeChange("income")}
            >
              Income
            </button>
          </div>

          <label>
            Amount
            <div className={styles.amountInput}>
              <span>₦</span>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) => updateField("amount", event.target.value)}
                placeholder="0.00"
                required
              />
            </div>
          </label>

          <label>
            {form.type === "income" ? "Income source" : "Expense category"}
            <select
              value={form.category_id}
              onChange={(event) =>
                updateField("category_id", Number(event.target.value))
              }
            >
              {availableCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Date
            <input
              type="date"
              value={form.transaction_date}
              onChange={(event) =>
                updateField("transaction_date", event.target.value)
              }
              required
            />
          </label>

          <label>
            Description <span className={styles.optionalLabel}>Optional</span>
            <input
              type="text"
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder={
                form.type === "income"
                  ? "e.g. Monthly allowance"
                  : "e.g. Lunch on campus"
              }
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
              {initialTransaction ? "Save changes" : "Save transaction"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
