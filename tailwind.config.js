/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Base dark theme colors
        background: {
          DEFAULT: '#0F172A', // Dark blue background
          secondary: '#1E293B', // Slightly lighter blue for cards/sections
        },
        primary: {
          DEFAULT: '#8B5CF6', // Main purple
          hover: '#7C3AED', // Darker purple for hover states
          light: '#A78BFA', // Lighter purple for accents
          dark: '#6D28D9', // Darker purple for active states
          foreground: 'hsl(var(--primary-foreground))'
        },
        accent: {
          DEFAULT: '#F472B6', // Pink accent
          hover: '#EC4899', // Darker pink for hover
          light: '#FBCFE8', // Light pink for subtle accents
          foreground: 'hsl(var(--accent-foreground))'
        },
        surface: {
          DEFAULT: '#1F2937', // Card/component background
          hover: '#374151', // Hover state for surface elements
          active: '#4B5563', // Active state for surface elements
        },
        text: {
          primary: '#F8FAFC', // Primary text color
          secondary: '#94A3B8', // Secondary/muted text
          accent: '#E2E8F0', // Accent text color
        },
        brand: {
          '50': '#f0f9ff',
          '100': '#e0f2fe',
          '200': '#bae6fd',
          '300': '#7dd3fc',
          '400': '#38bdf8',
          '500': '#0ea5e9',
          '600': '#0284c7',
          '700': '#0369a1',
          '800': '#075985',
          '900': '#0c4a6e',
          '950': '#082f49'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        },
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        foreground: 'hsl(var(--foreground))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        }
      },
      boxShadow: {
        'glow': '0 0 15px 2px rgba(139, 92, 246, 0.3)', // Purple glow effect
        'glow-hover': '0 0 20px 5px rgba(139, 92, 246, 0.4)', // Stronger glow for hover
        'inner-glow': 'inset 0 0 15px 2px rgba(139, 92, 246, 0.2)', // Inner glow effect
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite', // Slower pulse animation
        'glow-pulse': 'glowPulse 2s infinite', // Custom glow pulse animation
        'fade-in': 'fade-in 0.5s ease-in-out',
        'fade-in-up': 'fade-in-up 0.5s ease-out'
      },
      keyframes: {
        glowPulse: {
          '0%, 100%': {
            boxShadow: '0 0 15px 2px rgba(139, 92, 246, 0.3)',
          },
          '50%': {
            boxShadow: '0 0 20px 5px rgba(139, 92, 246, 0.4)',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0'
          },
          '100%': {
            opacity: '1'
          }
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(10px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        }
      },
      borderRadius: {
        'xl': '1rem', // Larger border radius for cards
        '2xl': '1.5rem', // Even larger border radius for modals
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      transitionDuration: {
        '400': '400ms', // Custom transition duration
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-game': 'linear-gradient(to right, #4F46E5, #7C3AED, #9333EA)', // Gaming gradient
      },
      fontFamily: {
        sans: [
          'var(--font-inter)'
        ]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class', // only generate classes
    }),
    require("tailwindcss-animate")
  ],
}
