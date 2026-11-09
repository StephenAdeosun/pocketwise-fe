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
          {isVisible ? "◉" : "◌"}
        </button>
      </span>
    </label>
  );
}
