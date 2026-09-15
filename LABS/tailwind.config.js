/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        plum: {
          DEFAULT: "#601D49",
          50: "#F6EEF3",
          100: "#EBDBE6",
          200: "#D3AFC5",
          300: "#B983A4",
          400: "#8E4C77",
          500: "#601D49",
          600: "#4C173A",
          700: "#39112B",
          800: "#270B1D",
          900: "#150610",
        },
        rose: {
          DEFAULT: "#BD5579",
          50: "#FBEFF3",
          100: "#F5D9E2",
          200: "#EAB2C3",
          300: "#DE8CA6",
          400: "#D06E8E",
          500: "#BD5579",
          600: "#9A4062",
          700: "#732F49",
          800: "#4D1F31",
        },
        teal: {
          DEFAULT: "#218DAE",
          50: "#EAF6F9",
          100: "#CEEAF1",
          200: "#9DD5E3",
          300: "#6CBFD5",
          400: "#3EA8C4",
          500: "#218DAE",
          600: "#1A7089",
          700: "#145465",
          800: "#0D3841",
        },
        paper: {
          DEFAULT: "#F6F0E4",
          light: "#FBF7EF",
          dark: "#ECE3D0",
          line: "#DED2B8",
        },
        ink: {
          DEFAULT: "#2B1B22",
          soft: "#5A4650",
          faint: "#8A7A82",
        },
      },
      fontFamily: {
        serif: ["'Source Serif 4'", "'Iowan Old Style'", "Georgia", "serif"],
        mono: ["'IBM Plex Mono'", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        grain:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        paper: "0 1px 2px rgba(43,27,34,0.06), 0 8px 24px -8px rgba(43,27,34,0.18)",
        card: "0 1px 3px rgba(43,27,34,0.08), 0 10px 30px -12px rgba(96,29,73,0.25)",
      },
      keyframes: {
        rise: {
          "0%": { opacity: 0, transform: "translateY(14px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        stampIn: {
          "0%": { opacity: 0, transform: "scale(1.15) rotate(-3deg)" },
          "100%": { opacity: 1, transform: "scale(1) rotate(-3deg)" },
        },
      },
      animation: {
        rise: "rise 0.7s cubic-bezier(0.22,1,0.36,1) both",
        stampIn: "stampIn 0.6s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};
