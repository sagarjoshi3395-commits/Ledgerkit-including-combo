/** @type {import('tailwindcss').Config} */
module.exports = {
    blocklist: ["overline"],
    darkMode: ["class"],
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
        "./public/index.html"
    ],
    theme: {
        extend: {
            fontFamily: {
                display: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                sans: ['"DM Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
                mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
            },
            colors: {
                ink: {
                    DEFAULT: '#0F172A',
                    surface: '#0B1437',
                    card: '#141D42',
                },
                brand: {
                    50: '#F3F1FD',
                    100: '#EAE7FB',
                    200: '#D6D0F8',
                    300: '#B3A8F2',
                    400: '#FFD400',
                    500: '#2E1AC8',
                    600: '#2E1AC8',
                    700: '#2213A0',
                    900: '#150C66',
                },
                ember: {
                    DEFAULT: '#EA580C',
                    hover: '#C2410C',
                    soft: '#FFF4ED',
                },
                mrg: {
                    navy: '#0B2A4A',
                    navydark: '#071B33',
                    teal: '#0E9AA7',
                    tealdark: '#0B7E88',
                    grassy: '#16A34A',
                    grape: '#7C3AED',
                    danger: '#DC2626',
                    slateink: '#475569',
                    mist: '#F4F8FB',
                    line: '#E3ECF3',
                },
                volt: '#D4FF11',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))'
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))'
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))'
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))'
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))'
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))'
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))'
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)'
            },
            boxShadow: {
                'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
                'subtle': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)',
                'mrg-soft': '0 4px 24px -6px rgba(11, 42, 74, 0.12)',
                'mrg-card': '0 10px 40px -12px rgba(11, 42, 74, 0.18)',
                'mrg-glow': '0 12px 30px -8px rgba(14, 154, 167, 0.45)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' }
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' }
                }
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out'
            }
        }
    },
    plugins: [require("tailwindcss-animate")],
};
