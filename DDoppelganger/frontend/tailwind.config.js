/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Playfair Display'", "serif"],
        body: ["'Inter'", "sans-serif"],
      },
      colors: {
        void: {
          DEFAULT: "#0a0509",
          soft: "#120810",
          raised: "#1b0d16",
          line: "#301620",
        },
        burgundy: {
          950: "#2b0710",
          900: "#420c18",
          800: "#5c0f22",
          700: "#7a122c",
          600: "#9a1836",
        },
        crimson: {
          500: "#c41f3d",
          400: "#e0294a",
          300: "#ef4360",
        },
        rose: {
          500: "#ec4f80",
          400: "#f56b95",
          300: "#ff8fb3",
          200: "#ffc0d4",
        },
        cream: "#f7e9ec",
      },
      boxShadow: {
        glow: "0 0 40px -8px rgba(224, 41, 74, 0.45)",
        "glow-soft": "0 0 24px -6px rgba(236, 79, 128, 0.35)",
        card: "0 12px 32px -12px rgba(0,0,0,0.6)",
      },
      backgroundImage: {
        "radial-glow":
          "radial-gradient(ellipse 80% 60% at 50% -10%, rgba(224,41,74,0.28), transparent), radial-gradient(ellipse 60% 50% at 100% 100%, rgba(236,79,128,0.14), transparent)",
        "card-sheen":
          "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0) 40%)",
      },
    },
  },
  plugins: [],
};
