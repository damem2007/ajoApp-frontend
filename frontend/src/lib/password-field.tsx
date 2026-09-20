"use client";

import { useId, useMemo, useState, type InputHTMLAttributes } from "react";

export type PasswordPolicy = {
  minLength?: number;
  requireUppercase?: boolean;
  requireLowercase?: boolean;
  requireNumber?: boolean;
  requireSpecial?: boolean;
};

export function passwordStrength(
  password: string,
  policy: PasswordPolicy = {},
) {
  const checks = [
    password.length >= (policy.minLength || 12),
    policy.requireUppercase === false || /[A-Z]/.test(password),
    policy.requireLowercase === false || /[a-z]/.test(password),
    policy.requireNumber === false || /\d/.test(password),
    policy.requireSpecial === false || /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  return { score, label: score <= 2 ? "Weak" : score <= 4 ? "Good" : "Strong" };
}

type PasswordFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "onChange" | "defaultValue" | "autoComplete"
> & {
  value?: string;
  defaultValue?: string | number;
  onChange?: (value: string) => void;
  label?: string;
  showStrength?: boolean;
  policy?: PasswordPolicy;
  autoComplete?: "current-password" | "new-password";
};

export function PasswordField({
  value,
  defaultValue,
  onChange,
  label = "Password",
  showStrength = false,
  policy,
  autoComplete = "current-password",
  id,
  ...inputProps
}: PasswordFieldProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const [visible, setVisible] = useState(false);
  const [localValue, setLocalValue] = useState(String(defaultValue ?? ""));
  const currentValue = value ?? localValue;
  const strength = useMemo(
    () => passwordStrength(currentValue, policy),
    [currentValue, policy],
  );
  return (
    <div className="password-field">
      <label htmlFor={inputId}>{label}</label>
      <span className="password-field-wrap">
        <input
          {...inputProps}
          id={inputId}
          type={visible ? "text" : "password"}
          value={currentValue}
          onChange={(event) => {
            setLocalValue(event.target.value);
            onChange?.(event.target.value);
          }}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className="password-visibility"
          disabled={inputProps.disabled}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-controls={inputId}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
            <circle cx="12" cy="12" r="3" />
            {visible && <path d="m3 3 18 18" />}
          </svg>
        </button>
      </span>
      {showStrength && currentValue && (
        <span className="password-strength" role="status">
          <span
            className={`password-strength-bar password-strength-${strength.score}`}
            aria-hidden="true"
          />
          <span>{strength.label}</span>
        </span>
      )}
    </div>
  );
}
