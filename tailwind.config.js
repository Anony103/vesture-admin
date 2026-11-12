/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
  			display: ['"Bricolage Grotesque"', '"DM Sans"', 'system-ui', 'sans-serif'],
  			mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
  			poppins: ['"DM Sans"', 'system-ui', 'sans-serif']
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			// the Vesture theme colours (see src/index.css); the /NN opacity forms work, e.g. bg-brand/20
  			brand: 'rgb(var(--brand-rgb) / <alpha-value>)',
  			mint: 'rgb(var(--mint-rgb) / <alpha-value>)',
  			gold: 'rgb(var(--gold-rgb) / <alpha-value>)',
  			danger: 'rgb(var(--danger-rgb) / <alpha-value>)',
  			fg: 'rgb(var(--fg-rgb) / <alpha-value>)',
  			fg2: 'rgb(var(--fg2-rgb) / <alpha-value>)',
  			fg3: 'rgb(var(--fg3-rgb) / <alpha-value>)',
  			ink: 'var(--ink)',
  			deck: 'var(--deck)',
  			surface: 'var(--surface)',
  			panel: 'var(--panel)',
  			'panel-hi': 'var(--panel-hi)',
  			field: 'var(--field)',
  			line: 'var(--line)',
  			'line-hi': 'var(--line-hi)',
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
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  daisyui: {
    themes: false, // Disable all themes
  },
  plugins: [require('daisyui'), require("tailwindcss-animate")],
}