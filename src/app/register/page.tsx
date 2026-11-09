"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAccount } from "@/services/auth-service";
import { PasswordField } from "@/components/password-field";
import { validatePassword } from "@/lib/validation";
import styles from "../auth.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirmation: "",
  });
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.full_name.trim().split(/\s+/).length < 2) {
      setError("Enter your first and last name.");
      return;
    }
    const passwordErrors = validatePassword(form.password);
    if (passwordErrors.length > 0) {
      setError(passwordErrors.join(" "));
      return;
    }
    if (form.password !== form.confirmation) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await registerAccount(
        form.full_name,
        form.email,
        form.password,
        form.confirmation,
      );
      router.push("/login");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Unable to create account.",
      );
    }
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authPanel}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>₦</span>
          <span>pocketwise</span>
        </Link>
        <h1>Create your account</h1>
        <p className={styles.subtitle}>
          Start building a clearer picture of your money.
        </p>
        <form className={styles.authForm} onSubmit={handleSubmit}>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <label>
            Full name
            <input
              type="text"
              value={form.full_name}
              onChange={(event) =>
                setForm({ ...form, full_name: event.target.value })
              }
              required
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm({ ...form, email: event.target.value })
              }
              required
            />
          </label>
          <PasswordField
            id="register-password"
            label="Password"
            value={form.password}
            onChange={(password) => setForm({ ...form, password })}
            minLength={8}
            autoComplete="new-password"
          />
          <p className={styles.passwordHint}>
            Use 8+ characters with uppercase, lowercase, a number, and a
            special character.
          </p>
          <PasswordField
            id="register-confirmation"
            label="Confirm password"
            value={form.confirmation}
            onChange={(confirmation) => setForm({ ...form, confirmation })}
            minLength={8}
            autoComplete="new-password"
          />
          <button className={styles.submitButton} type="submit">
            Create account
          </button>
        </form>
        <p className={styles.switchText}>
          Already have an account? <Link href="/auth/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
