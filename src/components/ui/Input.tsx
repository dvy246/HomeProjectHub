import React, { useId } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  suffix?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  suffix,
  className = "",
  type = "text",
  id,
  ...props
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;

  return (
    <div className="w-full flex flex-col gap-1.5 select-none">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-medium text-neutral-600 dark:text-neutral-400 select-none cursor-pointer"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center w-full">
        <input
          id={inputId}
          type={type}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={`w-full text-sm bg-transparent border rounded-md h-10 px-3 transition-colors focus:outline-none focus:border-black dark:focus:border-white text-neutral-900 dark:text-neutral-100 ${
            error
              ? "border-red-500 focus:border-red-500"
              : "border-neutral-200 dark:border-neutral-800"
          } ${suffix ? "pr-12" : ""} ${className}`}
          {...props}
        />
        {suffix && (
          <span className="absolute right-3 text-xs text-neutral-400 dark:text-neutral-600 font-medium pointer-events-none">
            {suffix}
          </span>
        )}
      </div>
      {error ? (
        <span
          id={errorId}
          aria-live="polite"
          className="text-xs text-red-600 dark:text-red-500 font-medium"
        >
          {error}
        </span>
      ) : (
        helperText && (
          <span
            id={helperId}
            className="text-xs text-neutral-400 dark:text-neutral-500"
          >
            {helperText}
          </span>
        )
      )}
    </div>
  );
};
