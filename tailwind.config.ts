import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1f2937', // Dark gray - industrial
        accent: '#3b82f6',  // Blue
        success: '#10b981', // Green
        warning: '#f59e0b', // Amber
        error: '#ef4444',   // Red
      },
    },
  },
  plugins: [],
}
export default config
