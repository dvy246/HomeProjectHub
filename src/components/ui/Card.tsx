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
      className={`border rounded-lg bg-neutral-50/50 dark:bg-neutral-900/30 border-neutral-200 dark:border-neutral-800 p-6 transition-all duration-200 ${
        hoverable || isClickable
          ? "hover:border-black dark:hover:border-white hover:bg-neutral-50 dark:hover:bg-neutral-900 cursor-pointer"
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
      className={`text-base font-medium tracking-tight text-neutral-900 dark:text-neutral-100 text-balance mb-2 ${className}`}
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
      className={`text-sm text-neutral-500 dark:text-neutral-400 text-pretty ${className}`}
    >
      {children}
    </p>
  );
};
