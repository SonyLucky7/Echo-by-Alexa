import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF7F2",
        cream: "#F5F0E8",
        charcoal: "#161616",
        "charcoal-muted": "#2A2A2A",
        olive: "#414A3E",
        "olive-light": "#556052",
        ember: "#C58F58",
        "ember-light": "#D8A672",
        sage: "#8B9D83",
        sand: "#EAE3D6",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Playfair Display", "Georgia", "serif"],
        sans: ["var(--font-jakarta)", "Plus Jakarta Sans", "Inter", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 2px 12px -2px rgba(22, 22, 22, 0.05)",
        card: "0 4px 24px -4px rgba(22, 22, 22, 0.08)",
        floating: "0 12px 40px -8px rgba(22, 22, 22, 0.16)",
      },
      animation: {
        "pulse-subtle": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        "slide-up": "slideUp 0.4s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
