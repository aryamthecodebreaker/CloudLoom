import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#FAF6EE", // page ground — warm, never pure white
        cream: "#F1EADB", // alternating band
        mist: "#EBE3D2", // hover tint
        ink: {
          DEFAULT: "#211B12",
          soft: "#57503F",
          faint: "#8C8371",
        },
        coal: "#161320", // dark sections — violet-tinted, not pure black
        accent: {
          DEFAULT: "#D6246E", // magenta — the one accent
          deep: "#A8175577",
        },
        rose: "#B01B56",
        line: "#E4DCCC",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-body)", "-apple-system", "Segoe UI", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "0 1px 0 rgba(33,27,18,.05)",
        graph: "0 10px 30px -12px rgba(214,36,110,.4)",
      },
    },
  },
  plugins: [],
};
export default config;
