import React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "dietary" | "spice" | "status" | "neutral" | "ember";
  size?: "sm" | "md";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className = "",
  variant = "neutral",
  size = "md",
  ...props
}) => {
  const baseStyles = "inline-flex items-center font-medium uppercase tracking-wider rounded-full";

  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5",
    md: "text-xs px-2.5 py-1",
  };

  const variantStyles = {
    dietary: "bg-olive/10 text-olive border border-olive/20",
    spice: "bg-ember/15 text-ember border border-ember/25",
    status: "bg-charcoal/10 text-charcoal border border-charcoal/20",
    neutral: "bg-sand/70 text-charcoal/80 border border-charcoal/10",
    ember: "bg-ember text-ivory",
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};
