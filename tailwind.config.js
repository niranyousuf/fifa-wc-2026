/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
  ],
  theme: {
    borderRadius: {
      none: "0",
      sm: "4px",
      DEFAULT: "4px",
      md: "4px",
      lg: "4px",
      xl: "4px",
      "2xl": "4px",
      "3xl": "4px",
      full: "4px",
    },
    extend: {
      colors: {
        wc: {
          navy: "#0a0f1e",
          accent: "hsl(var(--wc-accent))",
          ink: "#1a237e",
        },
      },
      fontFamily: {
        display: [
          "var(--font-display)",
          "Playfair Display",
          "Georgia",
          "serif",
        ],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        content: "1400px",
      },
      boxShadow: {
        "fixture-hover":
          "0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px hsl(var(--wc-accent) / 0.25)",
      },
    },
  },
  plugins: [],
};
