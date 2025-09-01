/**
 * SISTEMA DE TOKENS DE DISEÑO UNIFICADO
 * Hablando de Caballos - Web & Mobile
 * 
 * Este archivo centraliza todos los tokens de diseño para garantizar
 * uniformidad completa entre plataformas web y móvil.
 */

// ======= COLORES UNIFICADOS =======
export const colors = {
  // Colores primarios - Identidad de marca
  primary: {
    brown: '#8B4513',
    brownLight: '#A0522D',
    brownDark: '#654321',
    brownLighter: '#B8860B', // Para estados hover
  },
  
  // Colores secundarios - Naturaleza ecuestre
  secondary: {
    green: '#4A7C59',
    greenLight: '#5D8B6A',
    greenDark: '#3A6B47',
    greenLighter: '#6B8E5A', // Para variaciones
  },
  
  // Colores neutros - Base elegante
  neutral: {
    cream: '#F5EFE6',
    sand: '#E8DCC0',
    beige: '#D4C2A0',
    tan: '#C4A676',
    ivory: '#FFFEF7', // Más claro para fondos
  },
  
  // Colores de acento - Detalles premium
  accent: {
    gold: '#B8860B',
    goldLight: '#DAA520',
    copper: '#B87333',
    bronze: '#CD7F32', // Para medallas/premios
  },
  
  // Grises cálidos - Jerarquía tipográfica
  warmGray: {
    50: '#FAFAF9',
    100: '#F5F5F4',
    200: '#E7E5E4',
    300: '#D6D3D1',
    400: '#A8A29E',
    500: '#78716C',
    600: '#57534E',
    700: '#44403C',
    800: '#292524',
    900: '#1C1917',
  },
  
  // Colores funcionales - Estados y feedback
  functional: {
    success: '#22C55E',
    warning: '#EAB308',
    error: '#EF4444',
    info: '#3B82F6',
    live: '#FF0000', // Para transmisiones en vivo
  },
  
  // Colores de overlay y transparencias
  overlay: {
    dark: 'rgba(28, 25, 23, 0.8)',
    light: 'rgba(255, 255, 255, 0.9)',
    brown: 'rgba(139, 69, 19, 0.1)',
    brownMedium: 'rgba(139, 69, 19, 0.2)',
  }
} as const;

// ======= TIPOGRAFÍA UNIFICADA =======
export const typography = {
  // Familias tipográficas
  fontFamily: {
    display: ['Crimson Text', 'Georgia', 'serif'],
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    serif: ['Crimson Text', 'Georgia', 'serif'],
    mono: ['JetBrains Mono', 'Consolas', 'monospace'],
  },
  
  // Tamaños de fuente - Escala modular
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem',   // 60px
    '7xl': '4.5rem',    // 72px
    '8xl': '6rem',      // 96px
    '9xl': '8rem',      // 128px
  },
  
  // Pesos de fuente
  fontWeight: {
    thin: '100',
    extralight: '200',
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900',
  },
  
  // Alturas de línea
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
  
  // Espaciado de letras
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0em',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  }
} as const;

// ======= ESPACIADO UNIFICADO =======
export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem',      // 384px
} as const;

// ======= RADIOS DE BORDE =======
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  '2xl': '1rem',    // 16px
  '3xl': '1.5rem',  // 24px
  full: '9999px',
} as const;

// ======= SOMBRAS UNIFICADAS =======
export const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  none: '0 0 #0000',
  
  // Sombras temáticas
  warm: '0 8px 16px -4px rgba(139, 69, 19, 0.15)',
  warmLg: '0 12px 20px -4px rgba(139, 69, 19, 0.2)',
  warmXl: '0 16px 32px -8px rgba(139, 69, 19, 0.25)',
  card: '0 10px 24px rgba(0, 0, 0, 0.06)',
} as const;

// ======= TRANSICIONES =======
export const transition = {
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },
  
  timing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounceSoft: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  }
} as const;

// ======= GRADIENTES CARACTERÍSTICOS =======
export const gradients = {
  hero: `linear-gradient(135deg, ${colors.primary.brown} 0%, ${colors.primary.brownLight} 100%)`,
  card: `linear-gradient(135deg, ${colors.neutral.cream} 0%, ${colors.neutral.sand} 100%)`,
  accent: `linear-gradient(135deg, ${colors.accent.gold} 0%, ${colors.accent.copper} 100%)`,
  warm: `linear-gradient(135deg, ${colors.warmGray[100]} 0%, ${colors.warmGray[200]} 100%)`,
  sunset: `linear-gradient(135deg, ${colors.accent.gold} 0%, ${colors.primary.brownLight} 50%, ${colors.primary.brown} 100%)`,
} as const;

// ======= BREAKPOINTS RESPONSIVOS =======
export const breakpoints = {
  xs: '475px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ======= Z-INDEX LAYERS =======
export const zIndex = {
  hide: -1,
  auto: 'auto',
  base: 0,
  docked: 10,
  dropdown: 1000,
  sticky: 1100,
  banner: 1200,
  overlay: 1300,
  modal: 1400,
  popover: 1500,
  skipLink: 1600,
  toast: 1700,
  tooltip: 1800,
} as const;

// ======= CONFIGURACIÓN DE ANIMACIONES =======
export const animations = {
  fadeIn: 'fadeIn 0.3s ease-in-out',
  fadeOut: 'fadeOut 0.3s ease-in-out',
  slideInUp: 'slideInUp 0.3s ease-out',
  slideInDown: 'slideInDown 0.3s ease-out',
  slideInLeft: 'slideInLeft 0.3s ease-out',
  slideInRight: 'slideInRight 0.3s ease-out',
  scaleIn: 'scaleIn 0.2s ease-out',
  scaleOut: 'scaleOut 0.2s ease-in',
  bounce: 'bounce 1s ease-in-out',
  pulse: 'pulse 2s infinite',
  pulseWarm: 'pulseWarm 2s infinite',
  spin: 'spin 1s linear infinite',
} as const;

// ======= UTILIDADES DE COMPONENTES =======
export const components = {
  button: {
    sizes: {
      xs: { padding: `${spacing[1]} ${spacing[2]}`, fontSize: typography.fontSize.xs },
      sm: { padding: `${spacing[2]} ${spacing[3]}`, fontSize: typography.fontSize.sm },
      md: { padding: `${spacing[2.5]} ${spacing[4]}`, fontSize: typography.fontSize.base },
      lg: { padding: `${spacing[3]} ${spacing[6]}`, fontSize: typography.fontSize.lg },
      xl: { padding: `${spacing[4]} ${spacing[8]}`, fontSize: typography.fontSize.xl },
    },
    variants: {
      primary: {
        background: gradients.hero,
        color: colors.neutral.cream,
        border: 'none',
      },
      secondary: {
        background: 'transparent',
        color: colors.primary.brown,
        border: `2px solid ${colors.primary.brown}`,
      },
      accent: {
        background: gradients.accent,
        color: colors.neutral.cream,
        border: 'none',
      },
      ghost: {
        background: 'transparent',
        color: colors.warmGray[700],
        border: 'none',
      }
    }
  },
  
  card: {
    variants: {
      default: {
        background: colors.neutral.cream,
        border: `1px solid ${colors.neutral.sand}`,
        borderRadius: borderRadius.xl,
        boxShadow: boxShadow.md,
      },
      elevated: {
        background: gradients.card,
        border: `1px solid ${colors.neutral.beige}`,
        borderRadius: borderRadius['2xl'],
        boxShadow: boxShadow.warmLg,
      },
      hero: {
        background: gradients.card,
        border: `1px solid ${colors.neutral.beige}`,
        borderRadius: borderRadius['2xl'],
        boxShadow: boxShadow.warmXl,
      }
    }
  }
} as const;

// ======= EXPORTACIÓN DE TIPOS =======
export type Colors = typeof colors;
export type Typography = typeof typography;
export type Spacing = typeof spacing;
export type BorderRadius = typeof borderRadius;
export type BoxShadow = typeof boxShadow;
export type Transition = typeof transition;
export type Gradients = typeof gradients;
export type Breakpoints = typeof breakpoints;
export type ZIndex = typeof zIndex;
export type Animations = typeof animations;
export type Components = typeof components;

// ======= UTILIDADES DE AYUDA =======
export const utils = {
  // Función para crear variables CSS
  createCSSVariables: (tokens: Record<string, any>, prefix = '--') => {
    const variables: Record<string, string> = {};
    
    const flatten = (obj: any, path = '') => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        const newPath = path ? `${path}-${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flatten(value, newPath);
        } else {
          variables[`${prefix}${newPath}`] = String(value);
        }
      });
    };
    
    flatten(tokens);
    return variables;
  },
  
  // Función para generar clases de utilidad
  generateUtilityClasses: () => {
    return {
      // Clases de color
      colors: Object.entries(colors).reduce((acc, [category, values]) => {
        if (typeof values === 'object') {
          Object.entries(values).forEach(([shade, value]) => {
            acc[`text-${category}-${shade}`] = { color: value };
            acc[`bg-${category}-${shade}`] = { backgroundColor: value };
            acc[`border-${category}-${shade}`] = { borderColor: value };
          });
        }
        return acc;
      }, {} as Record<string, any>),
      
      // Clases de espaciado
      spacing: Object.entries(spacing).reduce((acc, [key, value]) => {
        acc[`p-${key}`] = { padding: value };
        acc[`m-${key}`] = { margin: value };
        acc[`px-${key}`] = { paddingLeft: value, paddingRight: value };
        acc[`py-${key}`] = { paddingTop: value, paddingBottom: value };
        acc[`mx-${key}`] = { marginLeft: value, marginRight: value };
        acc[`my-${key}`] = { marginTop: value, marginBottom: value };
        return acc;
      }, {} as Record<string, any>),
    };
  }
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  boxShadow,
  transition,
  gradients,
  breakpoints,
  zIndex,
  animations,
  components,
  utils,
};
