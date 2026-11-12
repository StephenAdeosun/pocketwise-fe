"use client";

import { useState } from "react";
import styles from "@/app/auth.module.css";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  minLength?: number;
  autoComplete?: string;
  required?: boolean;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  minLength,
  autoComplete,
  required = true,
}: PasswordFieldProps) {
  const [isVisible, setVisible] = useState(false);

  return (
    <label htmlFor={id}>
      {label}
      <span className={styles.passwordInput}>
        <input
          id={id}
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          minLength={minLength}
          autoComplete={autoComplete}
          required={required}
        />
        <button
          className={styles.passwordToggle}
          type="button"
          onClick={() => setVisible((visible) => !visible)}
          aria-label={isVisible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          aria-pressed={isVisible}
        >
          <svg
            aria-hidden="true"
            className={styles.passwordIcon}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isVisible ? (
              <>
                <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                <circle cx="12" cy="12" r="2.5" />
              </>
            ) : (
              <>
                <path d="M3 3l18 18" />
                <path d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a17.5 17.5 0 0 1-3.2 3.8" />
                <path d="M6.5 7.1C3.9 8.5 2.5 12 2.5 12s3.5 6 9.5 6c.8 0 1.6-.1 2.3-.3" />
              </>
            )}
          </svg>
        </button>
      </span>
    </label>
  );
}
