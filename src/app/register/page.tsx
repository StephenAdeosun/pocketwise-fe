"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerAccount } from "@/services/auth-service";
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
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
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
          <label>
            Password
            <input
              type="password"
              minLength={6}
              value={form.password}
              onChange={(event) =>
                setForm({ ...form, password: event.target.value })
              }
              required
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              minLength={6}
              value={form.confirmation}
              onChange={(event) =>
                setForm({ ...form, confirmation: event.target.value })
              }
              required
            />
          </label>
          <button className={styles.submitButton} type="submit">
            Create account
          </button>
        </form>
        <p className={styles.switchText}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}
