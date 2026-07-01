import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
  hoverable = false,
}) => {
  const isClickable = typeof onClick === "function";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isClickable && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className={`rounded-xl border bg-[var(--card-bg)] border-[var(--border)] p-6 transition-[border-color,background-color] duration-200 ${
        hoverable || isClickable
          ? "hover:border-[var(--border-hover)] hover:bg-[var(--card-bg-hover)] cursor-pointer card-elevated"
          : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({
  children,
  className = "",
}) => {
  return (
    <h3
      className={`text-base font-semibold tracking-tight text-[var(--fg)] text-balance mb-1.5 ${className}`}
    >
      {children}
    </h3>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
  className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({
  children,
  className = "",
}) => {
  return (
    <p
      className={`text-sm text-[var(--fg-secondary)] text-pretty leading-relaxed ${className}`}
    >
      {children}
    </p>
  );
};
