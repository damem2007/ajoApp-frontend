"use client";
import { useState, useId } from "react";
import type { FormValues } from "@/lib/types";
import { PasswordField, type PasswordPolicy } from "@/lib/password-field";
import { ApiError } from "@/lib/api/client";
import { useToast } from "@/providers/toast-provider";
export type Field = {
  name: string;
  label: string;
  type?:
    | "text"
    | "email"
    | "tel"
    | "password"
    | "number"
    | "date"
    | "textarea"
    | "select"
    | "checkbox"
    | "file";
  value?: string | number | boolean;
  options?: readonly (string | readonly [string, string])[];
  optional?: boolean;
  min?: number;
  max?: number;
  step?: string;
  minLength?: number;
  maxLength?: number;
  autoComplete?: "current-password" | "new-password";
  showStrength?: boolean;
  passwordPolicy?: PasswordPolicy;
};
export default function Form({
  fields,
  label,
  submit,
}: {
  fields: Field[];
  label: string;
  submit: (values: FormValues) => Promise<unknown>;
}) {
  const prefix = useId(),
    [busy, setBusy] = useState(false),
    [errors, setErrors] = useState<Record<string, string>>({}),
    { notify } = useToast();
  return (
    <form
      className="panel"
      noValidate
      onSubmit={async (event) => {
        event.preventDefault();
        const form = event.currentTarget,
          values: FormValues = {},
          problems: Record<string, string> = {};
        for (const field of fields) {
          const input = form.elements.namedItem(field.name) as HTMLInputElement;
          values[field.name] =
            field.type === "checkbox"
              ? input.checked
              : field.type === "number"
                ? Number(input.value)
                : field.type === "file"
                  ? input.files?.[0] || null
                  : input.value;
          if (!input.checkValidity())
            problems[field.name] = input.validity.valueMissing
              ? "Please enter " + field.label.toLowerCase() + "."
              : "Check " + field.label.toLowerCase() + " and try again.";
        }
        setErrors(problems);
        if (Object.keys(problems).length) {
          notify(Object.values(problems).join(" "), true);
          (
            form.elements.namedItem(Object.keys(problems)[0]) as HTMLElement
          ).focus();
          return;
        }
        setBusy(true);
        try {
          await submit(values);
        } catch (error) {
          if (error instanceof ApiError)
            setErrors(
              Object.fromEntries(error.fields.map((f) => [f.field, f.message])),
            );
          notify(
            error instanceof Error ? error.message : "Please try again.",
            true,
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="fields">
        {fields.map((field) => {
          const id = prefix + "-" + field.name,
            props = {
              id,
              name: field.name,
              required: field.type !== "checkbox" && !field.optional,
              defaultValue:
                typeof field.value === "boolean" ? undefined : field.value,
              "aria-invalid": !!errors[field.name],
              "aria-describedby": errors[field.name]
                ? id + "-error"
                : undefined,
            };
          return (
            <div key={field.name}>
              {field.type !== "password" && (
                <label htmlFor={id}>{field.label}</label>
              )}
              {field.type === "password" ? (
                <PasswordField
                  {...props}
                  label={field.label}
                  minLength={field.minLength}
                  maxLength={field.maxLength}
                  autoComplete={field.autoComplete || "current-password"}
                  showStrength={field.showStrength}
                  policy={field.passwordPolicy}
                />
              ) : field.type === "select" ? (
                <select {...props}>
                  {field.options?.map((option) => {
                    const [value, text] =
                      typeof option === "string" ? [option, option] : option;
                    return (
                      <option key={value} value={value}>
                        {text}
                      </option>
                    );
                  })}
                </select>
              ) : field.type === "textarea" ? (
                <textarea {...props} />
              ) : field.type === "checkbox" ? (
                <input
                  id={id}
                  name={field.name}
                  type="checkbox"
                  defaultChecked={!!field.value}
                />
              ) : (
                <input
                  {...props}
                  type={field.type || "text"}
                  min={field.min}
                  max={field.max}
                  step={field.step || "1"}
                  minLength={field.minLength}
                  maxLength={field.maxLength}
                />
              )}{" "}
              {errors[field.name] && (
                <p className="field-error" id={id + "-error"}>
                  {errors[field.name]}
                </p>
              )}
            </div>
          );
        })}
      </div>
      <button disabled={busy}>{busy ? "Please wait…" : label}</button>
    </form>
  );
}
