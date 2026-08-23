import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {
      colors: {
        "holatia-green": {
          dark: "#163D28",
          mid: "#2B6E4A",
        },
        "holatia-cream": "#F7F4EA",
        "holatia-gold": "#C9A84C",
      },
      fontFamily: {
        sans: ["var(--font-ui)", "IBM Plex Sans", "system-ui", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
