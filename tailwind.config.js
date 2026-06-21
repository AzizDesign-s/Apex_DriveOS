/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      screens: {
        xs: "400px",
      },
      colors: {
        // These now point to CSS variables — not hardcoded hex
        // When .dark is on <html>, the variables change → everything updates
        base: "var(--color-base)",
        card: "var(--color-card)",
        "card-hover": "var(--color-card-hover)",
        border: "var(--color-border)",

        "text-primary": "var(--color-text-primary)",
        "text-muted": "var(--color-text-muted)",
        "text-subtle": "var(--color-text-subtle)",

        // Gold stays the same in both themes
        gold: {
          DEFAULT: "#EBB811",
          light: "#F9D855",
          dark: "#B18F22",
          muted: "rgba(212,175,55,0.12)",
        },
        sky: {
          accent: "#60A5FA",
          muted: "rgba(56,189,248,0.12)",
        },
      },
      fontFamily: {
        display: ["Montserrat", "sans-serif"],
        body: ["Montserrat", "sans-serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
      boxShadow: {
        gold: "0 0 20px rgba(212,175,55,0.15)",
        "gold-lg": "0 0 40px rgba(212,175,55,0.25)",
        glass: "0 8px 32px rgba(0,0,0,0.4)",
        card: "0 4px 24px rgba(0,0,0,0.3)",
      },
      backdropBlur: {
        glass: "12px",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: "0" }, "100%": { opacity: "1" } },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        glowPulse: {
          "0%,100%": { boxShadow: "0 0 20px rgba(212,175,55,0.15)" },
          "50%": { boxShadow: "0 0 40px rgba(212,175,55,0.35)" },
        },
      },
    },
  },
  plugins: [],
};
