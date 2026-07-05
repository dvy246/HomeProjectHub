import type React from "react";
import { useI18n } from "../i18n/I18nProvider";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  className = "",
  disabled,
  ...props
}) => {
  const { t } = useI18n();
  const base =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed motion-safe:active:scale-[0.98]";

  const variants = {
    primary:
      "bg-[var(--accent)] text-[var(--accent-fg)] hover:bg-[var(--accent-hover)] border border-[var(--accent)] shadow-sm",
    secondary:
      "bg-transparent text-[var(--fg)] border border-[var(--border-strong)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-muted)]",
    ghost:
      "bg-transparent text-[var(--fg-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)] border border-transparent",
    danger:
      "bg-[var(--error)] text-[var(--error-fg)] hover:opacity-90 border border-[var(--error)] shadow-sm",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs h-8",
    md: "px-4 py-2 text-sm h-10",
    lg: "px-6 py-3 text-base h-12",
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="motion-safe:animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>{t('button.loading') ?? 'Loading…'}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};
