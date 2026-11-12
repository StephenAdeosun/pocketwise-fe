"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (form.full_name.trim().split(/\s+/).length < 2) {
      toast.error("Enter your first and last name.");
      return;
    }
    const passwordErrors = validatePassword(form.password);
    if (passwordErrors.length > 0) {
      toast.error(passwordErrors.join(" "));
      return;
    }
    if (form.password !== form.confirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      await registerAccount(
        form.full_name,
        form.email,
        form.password,
        form.confirmation,
      );
      toast.success("Account created. You can now log in.");
      router.push("/login");
    } catch (reason) {
      toast.error(
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
          <label>
            Full name
            <input
              type="text"
              value={form.full_name}
              onChange={(event) => {
                toast.dismiss();
                setForm({ ...form, full_name: event.target.value })
              }}
              required
            />
          </label>
          <label>
            Email address
            <input
              type="email"
              value={form.email}
              onChange={(event) => {
                toast.dismiss();
                setForm({ ...form, email: event.target.value })
              }}
              required
            />
          </label>
          <PasswordField
            id="register-password"
            label="Password"
            value={form.password}
            onChange={(password) => {
              toast.dismiss();
              setForm({ ...form, password });
            }}
            minLength={6}
            autoComplete="new-password"
          />
          <p className={styles.passwordHint}>
            Use at least 6 characters.
          </p>
          <PasswordField
            id="register-confirmation"
            label="Confirm password"
            value={form.confirmation}
            onChange={(confirmation) => {
              toast.dismiss();
              setForm({ ...form, confirmation });
            }}
            minLength={6}
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
