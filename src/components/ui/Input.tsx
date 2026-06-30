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
}: InputProps) {
  const id = useId();

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-xs font-medium text-neutral-600 dark:text-neutral-400 cursor-pointer">
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
        className="w-full text-sm bg-transparent border rounded-md h-10 px-3 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-300 dark:placeholder:text-neutral-600 focus:outline-none focus:border-neutral-900 dark:focus:border-neutral-100 focus:ring-2 focus:ring-neutral-900/5 dark:focus:ring-neutral-100/5 transition-all"
      />
      {helperText && (
        <span className="text-[10px] text-neutral-400 dark:text-neutral-500 leading-tight">
          {helperText}
        </span>
      )}
    </div>
  );
}
