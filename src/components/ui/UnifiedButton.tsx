'use client';

import React, { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

interface UnifiedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'outline' | 'danger';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  shadow?: boolean;
  href?: string;
  as?: 'button' | 'a';
  children: React.ReactNode;
}

const VARIANT_STYLES = {
  primary: `
    bg-gradient-to-r from-primary-brown to-primary-brown-light text-white
    hover:from-primary-brown-dark hover:to-primary-brown hover:shadow-warm
    active:scale-95 focus:ring-2 focus:ring-primary-brown focus:ring-offset-2
    disabled:from-warm-gray-300 disabled:to-warm-gray-400 disabled:text-warm-gray-500
  `,
  secondary: `
    bg-white border-2 border-primary-brown text-primary-brown
    hover:bg-primary-brown hover:text-white hover:shadow-warm
    active:scale-95 focus:ring-2 focus:ring-primary-brown focus:ring-offset-2
    disabled:border-warm-gray-300 disabled:text-warm-gray-400 disabled:hover:bg-white
  `,
  accent: `
    bg-gradient-to-r from-accent-gold to-accent-copper text-white
    hover:from-accent-gold hover:to-accent-bronze hover:shadow-lg
    active:scale-95 focus:ring-2 focus:ring-accent-gold focus:ring-offset-2
    disabled:from-warm-gray-300 disabled:to-warm-gray-400 disabled:text-warm-gray-500
  `,
  ghost: `
    bg-transparent text-warm-gray-700 
    hover:text-primary-brown hover:bg-neutral-sand
    active:scale-95 focus:ring-2 focus:ring-primary-brown focus:ring-offset-2
    disabled:text-warm-gray-400 disabled:hover:bg-transparent
  `,
  outline: `
    bg-transparent border-2 border-warm-gray-300 text-warm-gray-700
    hover:border-primary-brown hover:text-primary-brown hover:bg-neutral-sand
    active:scale-95 focus:ring-2 focus:ring-primary-brown focus:ring-offset-2
    disabled:border-warm-gray-200 disabled:text-warm-gray-400
  `,
  danger: `
    bg-error text-white
    hover:bg-red-600 hover:shadow-lg
    active:scale-95 focus:ring-2 focus:ring-error focus:ring-offset-2
    disabled:bg-warm-gray-300 disabled:text-warm-gray-500
  `,
} as const;

const SIZE_STYLES = {
  xs: 'px-2.5 py-1.5 text-xs font-medium',
  sm: 'px-3 py-2 text-sm font-medium',
  md: 'px-4 py-2.5 text-base font-medium',
  lg: 'px-6 py-3 text-lg font-medium',
  xl: 'px-8 py-4 text-xl font-semibold',
} as const;

const ROUNDED_STYLES = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  full: 'rounded-full',
} as const;

const UnifiedButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, UnifiedButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    rounded = 'lg',
    shadow = false,
    href,
    as = 'button',
    className = '',
    disabled,
    children,
    ...props
  }, ref) => {
    const baseClasses = `
      inline-flex items-center justify-center gap-2
      font-sans transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-offset-white
      disabled:cursor-not-allowed disabled:opacity-60 disabled:transform-none
      ${fullWidth ? 'w-full' : ''}
      ${shadow ? 'shadow-md hover:shadow-lg' : ''}
      ${SIZE_STYLES[size]}
      ${VARIANT_STYLES[variant]}
      ${ROUNDED_STYLES[rounded]}
      ${className}
    `;

    const content = (
      <>
        {loading && (
          <Loader2 className="w-4 h-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="flex-shrink-0">{leftIcon}</span>
        )}
        <span className={loading ? 'opacity-70' : ''}>
          {loading && loadingText ? loadingText : children}
        </span>
        {!loading && rightIcon && (
          <span className="flex-shrink-0">{rightIcon}</span>
        )}
      </>
    );

    if (as === 'a' || href) {
      return (
        <a
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={href}
          className={baseClasses}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {content}
        </a>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={baseClasses}
        disabled={disabled || loading}
        {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {content}
      </button>
    );
  }
);

UnifiedButton.displayName = 'UnifiedButton';

export default UnifiedButton;

// Componentes especializados para casos comunes
export function PrimaryButton(props: Omit<UnifiedButtonProps, 'variant'>) {
  return <UnifiedButton {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<UnifiedButtonProps, 'variant'>) {
  return <UnifiedButton {...props} variant="secondary" />;
}

export function AccentButton(props: Omit<UnifiedButtonProps, 'variant'>) {
  return <UnifiedButton {...props} variant="accent" />;
}

export function GhostButton(props: Omit<UnifiedButtonProps, 'variant'>) {
  return <UnifiedButton {...props} variant="ghost" />;
}

export function OutlineButton(props: Omit<UnifiedButtonProps, 'variant'>) {
  return <UnifiedButton {...props} variant="outline" />;
}

export function DangerButton(props: Omit<UnifiedButtonProps, 'variant'>) {
  return <UnifiedButton {...props} variant="danger" />;
}

// Grupo de botones para layouts complejos
interface ButtonGroupProps {
  children: React.ReactNode;
  orientation?: 'horizontal' | 'vertical';
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ButtonGroup({ 
  children, 
  orientation = 'horizontal', 
  spacing = 'md',
  className = '' 
}: ButtonGroupProps) {
  const spacingClasses = {
    sm: orientation === 'horizontal' ? 'gap-2' : 'gap-2',
    md: orientation === 'horizontal' ? 'gap-3' : 'gap-3',
    lg: orientation === 'horizontal' ? 'gap-4' : 'gap-4',
  };

  const orientationClasses = {
    horizontal: 'flex flex-row flex-wrap',
    vertical: 'flex flex-col',
  };

  return (
    <div className={`
      ${orientationClasses[orientation]}
      ${spacingClasses[spacing]}
      ${className}
    `}>
      {children}
    </div>
  );
}

// Botón flotante para acciones principales
interface FloatingActionButtonProps extends Omit<UnifiedButtonProps, 'variant' | 'size' | 'rounded'> {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  offset?: 'sm' | 'md' | 'lg';
}

export function FloatingActionButton({
  position = 'bottom-right',
  offset = 'md',
  className = '',
  ...props
}: FloatingActionButtonProps) {
  const positionClasses = {
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
  };

  const offsetClasses = {
    sm: 'mb-16 mr-4', // Ajuste para navegación móvil
    md: 'mb-20 mr-6',
    lg: 'mb-24 mr-8',
  };

  return (
    <UnifiedButton
      {...props}
      variant="accent"
      size="lg"
      rounded="full"
      shadow
      className={`
        fixed z-40 w-14 h-14 p-0
        ${positionClasses[position]}
        ${position.includes('bottom') ? offsetClasses[offset] : ''}
        hover:scale-110 active:scale-95
        shadow-warm-lg hover:shadow-warm-xl
        ${className}
      `}
    />
  );
}

// Hook para estados de botón
export function useButtonState(initialLoading = false) {
  const [loading, setLoading] = React.useState(initialLoading);
  const [disabled, setDisabled] = React.useState(false);

  const startLoading = () => setLoading(true);
  const stopLoading = () => setLoading(false);
  const enable = () => setDisabled(false);
  const disable = () => setDisabled(true);

  return {
    loading,
    disabled,
    startLoading,
    stopLoading,
    enable,
    disable,
    setLoading,
    setDisabled,
  };
}
