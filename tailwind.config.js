import remToPx from 'tailwindcss-rem-to-px'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        accent: 'var(--accent)',
        foreground: 'var(--fg)',
        background: 'var(--bg)',
        'muted-foreground': 'var(--muted-fg)',
        muted: 'var(--muted)',
        card: 'var(--card)',
        border: 'var(--border)'
      }
    }
  },
  plugins: [remToPx({ baseFontSize: 16 })]
}
