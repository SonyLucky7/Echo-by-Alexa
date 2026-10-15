import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "ember" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]";

    const variantStyles = {
      primary:
        "bg-charcoal text-ivory hover:bg-charcoal/90 focus-visible:ring-charcoal shadow-sm",
      secondary:
        "border border-charcoal/20 text-charcoal hover:bg-cream focus-visible:ring-charcoal",
      ghost: "text-charcoal hover:bg-cream/80 focus-visible:ring-charcoal",
      ember:
        "bg-ember text-ivory hover:bg-ember-light focus-visible:ring-ember shadow-sm",
      danger:
        "bg-red-700 text-ivory hover:bg-red-800 focus-visible:ring-red-700 shadow-sm",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 rounded-full gap-1.5",
      md: "text-sm px-4 py-2 rounded-full gap-2",
      lg: "text-base px-6 py-3 rounded-full gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
