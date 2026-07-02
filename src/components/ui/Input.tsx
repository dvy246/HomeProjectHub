import type React from "react";
import { useId } from "react";

interface InputProps {
  label: string;
  name?: string;
  type?: string;
  inputMode?: "text" | "decimal" | "numeric" | "tel" | "email" | "url";
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  helperText?: string;
  autocomplete?: string;
  className?: string;
  min?: string;
  max?: string;
  step?: string;
  ariaLabel?: string;
  error?: string;
  required?: boolean;
  spellcheck?: boolean;
}

export function Input({
  label,
  name,
  type = "text",
  inputMode,
  value,
  onChange,
  placeholder,
  helperText,
  autocomplete = "off",
  className = "",
  min,
  max,
  step,
  ariaLabel,
  error,
  required,
  spellcheck,
}: InputProps) {
  const id = useId();
  const descriptionId = error || helperText ? `${id}-desc` : undefined;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-xs font-medium text-[var(--fg-secondary)] cursor-pointer">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autocomplete}
        min={min}
        max={max}
        step={step}
        required={required}
        spellCheck={spellcheck}
        aria-label={ariaLabel || label}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={descriptionId}
        className={`w-full text-sm bg-[var(--bg-inset)] border rounded-lg h-10 px-3 text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[var(--border-hover)] focus:bg-[var(--bg)] focus:ring-2 focus:ring-[var(--ring)]/5 transition-colors ${
          error ? "border-[var(--error)]" : "border-[var(--border)]"
        } ${type === "number" ? "tabular-nums" : ""}`}
      />
      {error ? (
        <span id={descriptionId} className="text-[10px] text-[var(--error)] leading-tight">{error}</span>
      ) : helperText ? (
        <span id={descriptionId} className="text-[10px] text-[var(--fg-muted)] leading-tight">{helperText}</span>
      ) : null}
    </div>
  );
}
