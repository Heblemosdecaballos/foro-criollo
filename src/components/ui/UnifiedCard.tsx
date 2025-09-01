'use client';

import { forwardRef } from 'react';

interface UnifiedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'hero' | 'flat' | 'bordered' | 'glass';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  shadow?: boolean;
  hover?: boolean;
  interactive?: boolean;
  gradient?: boolean;
  children: React.ReactNode;
}

const VARIANT_STYLES = {
  default: `
    bg-white border border-neutral-sand
    shadow-md hover:shadow-warm
  `,
  elevated: `
    bg-gradient-card border border-neutral-beige
    shadow-warm-lg hover:shadow-warm-xl
  `,
  hero: `
    bg-gradient-card border border-neutral-beige
    shadow-warm-xl hover:shadow-warm-xl
  `,
  flat: `
    bg-neutral-cream border border-neutral-sand
    shadow-none hover:shadow-sm
  `,
  bordered: `
    bg-white border-2 border-primary-brown/20
    shadow-sm hover:shadow-md hover:border-primary-brown/40
  `,
  glass: `
    bg-white/80 backdrop-blur-md border border-white/20
    shadow-lg hover:shadow-xl
  `,
} as const;

const PADDING_STYLES = {
  none: 'p-0',
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
} as const;

const ROUNDED_STYLES = {
  sm: 'rounded-md',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  xl: 'rounded-2xl',
  '2xl': 'rounded-2xl',
  '3xl': 'rounded-3xl',
} as const;

const UnifiedCard = forwardRef<HTMLDivElement, UnifiedCardProps>(
  ({
    variant = 'default',
    padding = 'md',
    rounded = 'xl',
    shadow = true,
    hover = true,
    interactive = false,
    gradient = false,
    className = '',
    children,
    ...props
  }, ref) => {
    const baseClasses = `
      transition-all duration-300 ease-in-out
      ${VARIANT_STYLES[variant]}
      ${PADDING_STYLES[padding]}
      ${ROUNDED_STYLES[rounded]}
      ${hover ? 'hover:scale-[1.02]' : ''}
      ${interactive ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}
      ${gradient ? 'bg-gradient-card' : ''}
      ${className}
    `;

    return (
      <div
        ref={ref}
        className={baseClasses}
        {...props}
      >
        {children}
      </div>
    );
  }
);

UnifiedCard.displayName = 'UnifiedCard';

export default UnifiedCard;

// Componentes especializados
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  avatar?: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
}

export function CardHeader({
  title,
  subtitle,
  action,
  avatar,
  padding = 'md',
  className = '',
  children,
  ...props
}: CardHeaderProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`
        flex items-start justify-between
        border-b border-neutral-sand/50
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      <div className="flex items-start gap-3 flex-1 min-w-0">
        {avatar && (
          <div className="flex-shrink-0">
            {avatar}
          </div>
        )}
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="font-display font-semibold text-warm-gray-900 text-lg leading-tight truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-warm-gray-600 text-sm mt-1 leading-relaxed">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
      {action && (
        <div className="flex-shrink-0 ml-4">
          {action}
        </div>
      )}
    </div>
  );
}

interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export function CardBody({
  padding = 'md',
  className = '',
  children,
  ...props
}: CardBodyProps) {
  const paddingClasses = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  };

  return (
    <div
      className={`
        ${paddingClasses[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: 'sm' | 'md' | 'lg';
  bordered?: boolean;
}

export function CardFooter({
  padding = 'md',
  bordered = true,
  className = '',
  children,
  ...props
}: CardFooterProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`
        ${paddingClasses[padding]}
        ${bordered ? 'border-t border-neutral-sand/50' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// Card con imagen
interface ImageCardProps extends Omit<UnifiedCardProps, 'children'> {
  src: string;
  alt: string;
  title: string;
  description?: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  imagePosition?: 'top' | 'left' | 'right';
}

export function ImageCard({
  src,
  alt,
  title,
  description,
  badge,
  action,
  aspectRatio = 'landscape',
  imagePosition = 'top',
  className = '',
  ...cardProps
}: ImageCardProps) {
  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]',
    landscape: 'aspect-[4/3]',
  };

  const layoutClasses = {
    top: 'flex flex-col',
    left: 'flex flex-row',
    right: 'flex flex-row-reverse',
  };

  return (
    <UnifiedCard
      {...cardProps}
      padding="none"
      className={`overflow-hidden ${className}`}
    >
      <div className={layoutClasses[imagePosition]}>
        {/* Imagen */}
        <div className={`
          relative overflow-hidden
          ${imagePosition === 'top' ? 'w-full' : 'w-1/3'}
          ${aspectRatioClasses[aspectRatio]}
        `}>
          <img
            src={src}
            alt={alt}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          {badge && (
            <div className="absolute top-3 left-3 z-10">
              {badge}
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className={`
          flex-1 p-4
          ${imagePosition !== 'top' ? 'flex flex-col justify-center' : ''}
        `}>
          <h3 className="font-display font-semibold text-warm-gray-900 text-lg mb-2 leading-tight">
            {title}
          </h3>
          {description && (
            <p className="text-warm-gray-600 text-sm leading-relaxed mb-4">
              {description}
            </p>
          )}
          {action && (
            <div className="mt-auto">
              {action}
            </div>
          )}
        </div>
      </div>
    </UnifiedCard>
  );
}

// Card de estadísticas
interface StatsCardProps extends Omit<UnifiedCardProps, 'children'> {
  title: string;
  value: string | number;
  change?: {
    value: string | number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon?: React.ReactNode;
  color?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  color = 'primary',
  className = '',
  ...cardProps
}: StatsCardProps) {
  const colorClasses = {
    primary: 'text-primary-brown bg-primary-brown/10',
    secondary: 'text-secondary-green bg-secondary-green/10',
    accent: 'text-accent-gold bg-accent-gold/10',
    success: 'text-success bg-success/10',
    warning: 'text-warning bg-warning/10',
    error: 'text-error bg-error/10',
  };

  const changeColorClasses = {
    increase: 'text-success',
    decrease: 'text-error',
    neutral: 'text-warm-gray-500',
  };

  return (
    <UnifiedCard
      {...cardProps}
      className={`text-center ${className}`}
    >
      {icon && (
        <div className={`
          w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center
          ${colorClasses[color]}
        `}>
          {icon}
        </div>
      )}
      
      <div className="text-3xl font-bold text-warm-gray-900 mb-1">
        {value}
      </div>
      
      <div className="text-sm font-medium text-warm-gray-600 mb-2">
        {title}
      </div>
      
      {change && (
        <div className={`text-xs font-medium ${changeColorClasses[change.type]}`}>
          {change.type === 'increase' && '+'}
          {change.value}
          {change.type !== 'neutral' && (
            <span className="ml-1">
              {change.type === 'increase' ? '↗' : '↘'}
            </span>
          )}
        </div>
      )}
    </UnifiedCard>
  );
}

// Card de perfil/usuario
interface ProfileCardProps extends Omit<UnifiedCardProps, 'children'> {
  name: string;
  role?: string;
  avatar: string;
  bio?: string;
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
  actions?: React.ReactNode;
}

export function ProfileCard({
  name,
  role,
  avatar,
  bio,
  stats,
  actions,
  className = '',
  ...cardProps
}: ProfileCardProps) {
  return (
    <UnifiedCard
      {...cardProps}
      className={`text-center ${className}`}
    >
      {/* Avatar */}
      <div className="relative w-20 h-20 mx-auto mb-4">
        <img
          src={avatar}
          alt={name}
          className="w-full h-full rounded-full object-cover border-4 border-white shadow-md"
        />
      </div>

      {/* Información */}
      <h3 className="font-display font-semibold text-warm-gray-900 text-lg mb-1">
        {name}
      </h3>
      
      {role && (
        <p className="text-warm-gray-600 text-sm mb-3">
          {role}
        </p>
      )}

      {bio && (
        <p className="text-warm-gray-600 text-sm leading-relaxed mb-4">
          {bio}
        </p>
      )}

      {/* Estadísticas */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-3 gap-4 py-4 border-t border-neutral-sand/50 mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="font-bold text-warm-gray-900">
                {stat.value}
              </div>
              <div className="text-xs text-warm-gray-600">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Acciones */}
      {actions && (
        <div className="pt-4 border-t border-neutral-sand/50">
          {actions}
        </div>
      )}
    </UnifiedCard>
  );
}
