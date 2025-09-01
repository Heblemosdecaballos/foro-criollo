// tailwind.config.ts
import type { Config } from "tailwindcss";
import designTokens from "./src/styles/design-tokens";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",   // <-- cubre app, components, lib, etc.
  ],
  theme: {
    extend: {
      // ======= COLORES UNIFICADOS =======
      colors: {
        // Legacy support
        "site-beige": designTokens.colors.neutral.cream,
        
        // Sistema de colores unificado desde tokens
        primary: {
          brown: designTokens.colors.primary.brown,
          "brown-light": designTokens.colors.primary.brownLight, 
          "brown-dark": designTokens.colors.primary.brownDark,
          "brown-lighter": designTokens.colors.primary.brownLighter,
        },
        secondary: {
          green: designTokens.colors.secondary.green,
          "green-light": designTokens.colors.secondary.greenLight,
          "green-dark": designTokens.colors.secondary.greenDark,
          "green-lighter": designTokens.colors.secondary.greenLighter,
        },
        neutral: {
          cream: designTokens.colors.neutral.cream,
          sand: designTokens.colors.neutral.sand, 
          beige: designTokens.colors.neutral.beige,
          tan: designTokens.colors.neutral.tan,
          ivory: designTokens.colors.neutral.ivory,
        },
        accent: {
          gold: designTokens.colors.accent.gold,
          "gold-light": designTokens.colors.accent.goldLight,
          copper: designTokens.colors.accent.copper,
          bronze: designTokens.colors.accent.bronze,
        },
        warm: {
          gray: designTokens.colors.warmGray,
        },
        
        // Colores funcionales
        success: designTokens.colors.functional.success,
        warning: designTokens.colors.functional.warning,
        error: designTokens.colors.functional.error,
        info: designTokens.colors.functional.info,
        live: designTokens.colors.functional.live,
        
        // Colores legacy para compatibilidad
        cream: {
          50:  "#F8F1E6",
          100: "#F1E8DA", 
          200: "#EADFCB",
        },
        brown: {
          700: "#5F422F",
          800: "#4B3325",
        },
        olive: {
          600: "#6F7F56",
          700: "#5E6D45", 
        },
        cafe: {
          a: "#B36A3E",
          b: "#7B5740",
        },
      },
      
      // ======= SOMBRAS UNIFICADAS =======
      boxShadow: {
        ...designTokens.boxShadow,
        // Mantener nombres legacy
        "warm-lg": designTokens.boxShadow.warmLg,
        "warm-xl": designTokens.boxShadow.warmXl,
      },
      
      // ======= TIPOGRAFÍA UNIFICADA =======
      fontFamily: designTokens.typography.fontFamily,
      
      fontSize: {
        // Tamaños responsivos especiales
        'hero': ['clamp(2.5rem, 8vw, 4rem)', { lineHeight: '1.1', fontWeight: '700' }],
        'h1': ['clamp(2rem, 5vw, 2.5rem)', { lineHeight: '1.2' }],
        'h2': ['clamp(1.5rem, 4vw, 2rem)', { lineHeight: '1.2' }],
        'h3': ['clamp(1.25rem, 3vw, 1.5rem)', { lineHeight: '1.3' }],
        'body-lg': ['1.125rem', { lineHeight: '1.6' }],
        'body': ['1rem', { lineHeight: '1.6' }],
        'body-sm': ['0.875rem', { lineHeight: '1.5' }],
        'caption': ['0.75rem', { lineHeight: '1.4' }],
        
        // Tamaños estándar desde tokens
        ...designTokens.typography.fontSize,
      },
      
      fontWeight: designTokens.typography.fontWeight,
      lineHeight: designTokens.typography.lineHeight,
      letterSpacing: designTokens.typography.letterSpacing,
      
      // ======= ESPACIADO UNIFICADO =======
      spacing: {
        ...designTokens.spacing,
        // Mantener nombres legacy
        'xs': designTokens.spacing[1],
        'sm': designTokens.spacing[2], 
        'md': designTokens.spacing[4],
        'lg': designTokens.spacing[6],
        'xl': designTokens.spacing[8],
        '2xl': designTokens.spacing[12],
        '3xl': designTokens.spacing[16],
      },
      
      // ======= BORDES UNIFICADOS =======
      borderRadius: {
        ...designTokens.borderRadius,
        // Mantener nombres legacy
        'sm': designTokens.borderRadius.md,
        'md': designTokens.borderRadius.lg,
        'lg': designTokens.borderRadius.xl, 
        'xl': designTokens.borderRadius['2xl'],
        '2xl': designTokens.borderRadius['3xl'],
      },
      
      // ======= TRANSICIONES UNIFICADAS =======
      transitionDuration: {
        ...designTokens.transition.duration,
        // Mantener nombres legacy
        'fast': designTokens.transition.duration[150],
        'normal': designTokens.transition.duration[300], 
        'slow': designTokens.transition.duration[500],
      },
      
      transitionTimingFunction: {
        ...designTokens.transition.timing,
        // Mantener nombres legacy
        'smooth': designTokens.transition.timing.smooth,
        'bounce-soft': designTokens.transition.timing.bounceSoft,
      },
      
      // ======= ANIMACIONES UNIFICADAS =======
      animation: {
        'fade-in-up': 'fadeInUp 250ms ease-out',
        'slide-in-right': 'slideInRight 250ms ease-out', 
        'slide-in-left': 'slideInLeft 250ms ease-out',
        'slide-in-down': 'slideInDown 250ms ease-out',
        'pulse-warm': 'pulseWarm 2s infinite',
        'bounce-soft': 'bounce 1s ease-in-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'scale-out': 'scaleOut 200ms ease-in',
      },
      
      keyframes: {
        fadeInUp: {
          'from': {
            opacity: '0',
            transform: 'translateY(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          }
        },
        slideInRight: {
          'from': {
            opacity: '0',
            transform: 'translateX(30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          }
        },
        slideInLeft: {
          'from': {
            opacity: '0',
            transform: 'translateX(-30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateX(0)',
          }
        },
        slideInDown: {
          'from': {
            opacity: '0',
            transform: 'translateY(-30px)',
          },
          'to': {
            opacity: '1',
            transform: 'translateY(0)',
          }
        },
        scaleIn: {
          'from': {
            opacity: '0',
            transform: 'scale(0.9)',
          },
          'to': {
            opacity: '1',
            transform: 'scale(1)',
          }
        },
        scaleOut: {
          'from': {
            opacity: '1',
            transform: 'scale(1)',
          },
          'to': {
            opacity: '0',
            transform: 'scale(0.9)',
          }
        },
        pulseWarm: {
          '0%, 100%': {
            boxShadow: '0 0 0 0 rgba(139, 69, 19, 0.4)',
          },
          '50%': {
            boxShadow: '0 0 0 10px rgba(139, 69, 19, 0)',
          }
        }
      },
      
      // ======= GRADIENTES UNIFICADOS =======
      backgroundImage: {
        'gradient-hero': designTokens.gradients.hero,
        'gradient-card': designTokens.gradients.card,
        'gradient-accent': designTokens.gradients.accent,
        'gradient-warm': designTokens.gradients.warm,
        'gradient-sunset': designTokens.gradients.sunset,
      },
      
      // ======= Z-INDEX UNIFICADO =======
      zIndex: designTokens.zIndex,
      
      // ======= BREAKPOINTS UNIFICADOS =======
      screens: designTokens.breakpoints,
    },
  },
  plugins: [],
};
export default config;
