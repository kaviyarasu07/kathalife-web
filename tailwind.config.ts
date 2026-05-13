import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        hand: ['var(--font-patrick-hand)', 'cursive'],
        display: ['var(--font-playfair-display)', 'Georgia', 'serif'],
        body: ['var(--font-dm-sans)', 'sans-serif'],
        journal: ['var(--font-lora)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
export default config;
