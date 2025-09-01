
'use client';

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hero' | 'glass' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', padding = 'md', hover = true, ...props }, ref) => {
    
    const baseStyles = "rounded-xl border transition-all duration-300 ease-in-out";
    
    const variants = {
      default: "card-unified",
      hero: "card-hero",
      glass: "bg-white/80 backdrop-blur-sm border-white/20 shadow-warm",
      elevated: "bg-white shadow-warm-lg border-neutral-sand"
    };
    
    const paddings = {
      none: "p-0",
      sm: "p-3",
      md: "p-4", 
      lg: "p-6",
      xl: "p-8"
    };
    
    const hoverStyles = hover ? "hover-lift" : "";
    
    return (
      <div
        className={cn(
          baseStyles,
          variants[variant],
          paddings[padding],
          hoverStyles,
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, padding = 'md', ...props }, ref) => {
    
    const paddings = {
      none: "p-0",
      sm: "p-3",
      md: "p-4",
      lg: "p-6", 
      xl: "p-8"
    };
    
    return (
      <div
        className={cn(paddings[padding], className)}
        ref={ref}
        {...props}
      />
    );
  }
);

CardBody.displayName = "CardBody";

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, actions, children, ...props }, ref) => {
    return (
      <div
        className={cn("flex items-start justify-between p-6 pb-4", className)}
        ref={ref}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-h3 font-serif font-semibold text-warm-gray-900 mb-1">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-body-sm text-warm-gray-600">
              {subtitle}
            </p>
          )}
          {children}
        </div>
        {actions && (
          <div className="ml-4 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  justify?: 'start' | 'center' | 'end' | 'between';
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, justify = 'end', ...props }, ref) => {
    
    const justifyClasses = {
      start: "justify-start",
      center: "justify-center", 
      end: "justify-end",
      between: "justify-between"
    };
    
    return (
      <div
        className={cn(
          "flex items-center gap-2 p-6 pt-4 border-t border-neutral-sand",
          justifyClasses[justify],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

CardFooter.displayName = "CardFooter";

export { Card, CardBody, CardHeader, CardFooter };
