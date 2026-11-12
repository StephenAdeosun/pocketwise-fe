"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { loginAccount } from "@/services/auth-service";
import { PasswordField } from "@/components/password-field";
import styles from "../auth.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await loginAccount(email, password);
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (reason) {
      toast.error(reason instanceof Error ? reason.message : "Unable to log in.");
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
          <label>
            Email address
            <input
              type="email"
              value={email}
              onChange={(event) => {
                toast.dismiss();
                setEmail(event.target.value);
              }}
              required
            />
          </label>
          <PasswordField
            id="login-password"
            label="Password"
            value={password}
            onChange={(value) => {
              toast.dismiss();
              setPassword(value);
            }}
            autoComplete="current-password"
          />
          <button className={styles.submitButton} type="submit">
            Log in
          </button>
        </form>
        <p className={styles.switchText}>
          New to pocketwise? <Link href="/auth/signup">Create an account</Link>
        </p>
      </section>
    </main>
  );
}
