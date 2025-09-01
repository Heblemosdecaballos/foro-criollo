
'use client';

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    leftIcon,
    rightIcon,
    children, 
    disabled,
    ...props 
  }, ref) => {
    
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      primary: "btn-primary",
      secondary: "btn-secondary", 
      accent: "btn-accent",
      ghost: "btn-ghost",
      outline: "border-2 border-warm-gray-300 text-warm-gray-700 bg-transparent hover:bg-warm-gray-50 hover:border-primary-brown focus:ring-primary-brown"
    };
    
    const sizes = {
      sm: "px-3 py-2 text-sm",
      md: "px-4 py-2.5 text-base", 
      lg: "px-6 py-3 text-base",
      xl: "px-8 py-4 text-lg"
    };
    
    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          loading && "cursor-wait",
          className
        )}
        disabled={disabled || loading}
        ref={ref}
        {...props}
      >
        {loading ? (
          <>
            <div className="animate-spin -ml-1 mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
            Cargando...
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2 flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2 flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
