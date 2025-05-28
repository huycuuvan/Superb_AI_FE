import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#D2FAE1',
					foreground: '#2D3748',
					hover: '#9DF1D7',
					light: '#FFF4F8',
					dark: '#A4F5D8'
				},
				secondary: {
					DEFAULT: '#FFF4F8',
					foreground: '#4A5568',
					hover: '#EBEEFC',
					light: '#F8FAFC',
					dark: '#A4F5D8'
				},
				accent: {
					DEFAULT: '#9DF1D7',
					foreground: '#2D3748',
					hover: '#A4F5D8',
					light: '#D2FAE1',
					dark: '#EBEEFC'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: '#D2FAE1',
					foreground: '#2D3748',
					primary: '#FFF4F8',
					'primary-foreground': '#4A5568',
					accent: '#9DF1D7',
					'accent-foreground': '#2D3748',
					border: '#EBEEFC',
					ring: '#A4F5D8'
				},
				// Custom color palette based on the main colors
				theme: {
					green: {
						DEFAULT: '#D2FAE1',
						50: '#F8FAFC',
						100: '#D2FAE1',
						200: '#9DF1D7',
						300: '#A4F5D8',
						400: '#EBEEFC',
						500: '#FFF4F8',
						600: '#475569',
						700: '#334155',
						800: '#1E293B',
						900: '#0F172A'
					},
					pink: {
						DEFAULT: '#FFF4F8',
						50: '#FFF5F7',
						100: '#FFF4F8',
						200: '#EBEEFC',
						300: '#A4F5D8',
						400: '#9DF1D7',
						500: '#D2FAE1',
						600: '#D53F8C',
						700: '#B83280',
						800: '#97266D',
						900: '#702459'
					}
				},
				// Team palette colors
				teampal: {
					100: '#D2FAE1',
					200: '#FFF4F8',
					300: '#9DF1D7',
					400: '#A4F5D8',
					500: '#EBEEFC'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-out': {
					'0%': {
						opacity: '1',
						transform: 'translateY(0)'
					},
					'100%': {
						opacity: '0',
						transform: 'translateY(10px)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'fade-out': 'fade-out 0.3s ease-out'
			},
			fontFamily: {
				'inter': ['Inter', 'sans-serif'],
				'rubik': ['Rubik', 'sans-serif']
			}
		}
	},
	plugins: [animate]
} satisfies Config;
