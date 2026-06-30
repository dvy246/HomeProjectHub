import React, { useId } from "react";

interface InputProps {
  label: string;
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
}

export function Input({
  label,
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
}: InputProps) {
  const id = useId();

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-xs font-medium text-[var(--fg-secondary)] cursor-pointer">
        {label}
      </label>
      <input
        id={id}
        type={type}
        inputMode={inputMode}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autocomplete}
        min={min}
        max={max}
        step={step}
        aria-label={ariaLabel || label}
        aria-invalid={error ? "true" : "false"}
        className={`w-full text-sm bg-[var(--bg-inset)] border rounded-lg h-10 px-3 text-[var(--fg)] placeholder:text-[var(--fg-muted)] focus:outline-none focus:border-[var(--border-hover)] focus:bg-[var(--bg)] focus:ring-2 focus:ring-[var(--ring)]/5 transition-all tabular-nums ${
          error ? "border-[var(--error)]" : "border-[var(--border)]"
        }`}
      />
      {error ? (
        <span className="text-[10px] text-[var(--error)] leading-tight">{error}</span>
      ) : helperText ? (
        <span className="text-[10px] text-[var(--fg-muted)] leading-tight">{helperText}</span>
      ) : null}
    </div>
  );
}
