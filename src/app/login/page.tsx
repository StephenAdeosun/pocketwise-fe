"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginAccount } from "@/services/auth-service";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await loginAccount(email, password);
      router.push("/");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to log in.");
    }
  }

  return (
    <main className={styles.authPage}>
      <section className={styles.authPanel}>
        <Link className={styles.brand} href="/">
          <span className={styles.brandMark}>₦</span>
          <span>pocketwise</span>
        </Link>
        <h1>Welcome back</h1>
        <p className={styles.subtitle}>
          Sign in to keep your student budget on track.
        </p>
        <form className={styles.authForm} onSubmit={handleSubmit}>
          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <button className={styles.submitButton} type="submit">
            Log in
          </button>
        </form>
        <p className={styles.switchText}>
          New to pocketwise? <Link href="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
