import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        wiz: {
          blue: "#2C6BFF",
          navy: "#0A1633",
          ink: "#101828",
          pink: "#FF4F9A",
          sky: "#EAF1FF",
          cloud: "#F7F9FD",
          line: "#E4E9F2",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,40,.06), 0 8px 24px -12px rgba(16,24,40,.14)",
        graph: "0 20px 60px -20px rgba(44,107,255,.35)",
      },
    },
  },
  plugins: [],
};
export default config;
