import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#d6eadd',   // 明るい若草色
          DEFAULT: '#7cbf8c', // ベースグリーン
          dark: '#4b8158',    // 深みのある緑
        },
        accent: {
          yellow: '#f3eac2',  // 柔らかな黄色（光）
          brown: '#9d856a',   // 木の幹や土の色（アクセント）
        },
      },
      fontFamily: {
        sans: ['"Noto Sans JP"', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        serif: ['"Shippori Mincho B1"', 'serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  daisyui: {
    themes: [
      {
        uchinokiroku: {
          "primary": "#7cbf8c",
          "secondary": "#f3eac2", 
          "accent": "#9d856a",
          "neutral": "#2a2e37",
          "base-100": "#ffffff",
          "base-200": "#f7f8fa",
          "base-300": "#d6eadd",
          "info": "#3abff8",
          "success": "#7cbf8c",
          "warning": "#fbbd23",
          "error": "#f87272",
        }
      },
      {
        dark: {
          "primary": "#7cbf8c",
          "secondary": "#f3eac2", 
          "accent": "#9d856a",
          "neutral": "#374151",
          "base-100": "#111827",
          "base-200": "#1f2937", 
          "base-300": "#374151",
          "base-content": "#f3f4f6",
          "info": "#3abff8",
          "success": "#7cbf8c",
          "warning": "#fbbd23",
          "error": "#f87272",
          "--rounded-box": "1rem",
          "--rounded-btn": "0.5rem",
          "--rounded-badge": "1.9rem",
          "--animation-btn": "0.25s",
          "--animation-input": "0.2s",
          "--btn-text-case": "uppercase",
          "--btn-focus-scale": "0.95",
          "--border-btn": "1px",
          "--tab-border": "1px",
          "--tab-radius": "0.5rem",
        }
      }
    ],
    base: true,
    styled: true,
    utils: true,
  },
}
export default config