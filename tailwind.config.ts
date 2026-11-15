import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        marquee: { to: { transform: "translateX(-50%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        drift: { "0%,100%": { transform: "translate(0,0) scale(1)" }, "50%": { transform: "translate(40px,-30px) scale(1.15)" } },
        sheen: { to: { backgroundPosition: "200% center" } },
      },
      animation: { marquee: "marquee 38s linear infinite", float: "float 6s ease-in-out infinite", drift: "drift 16s ease-in-out infinite", sheen: "sheen 6s linear infinite" },
      colors: {
        // streamerOS Signal Kit, same tokens as the other sites.
        ink: "#05070A",
        cyan: { DEFAULT: "#22D3EE", 400: "#22D3EE", 500: "#22D3EE", 900: "#164e63" },
        purple: { DEFAULT: "#A855F7", 400: "#A855F7", 500: "#A855F7" },
        // v3 semantic tokens (DESIGN_SYSTEM.md). Use these, never arbitrary values.
        surface: "#0A0B0D",
        line: "rgb(255 255 255 / 0.1)",
        success: "#4ADE80",
        warning: "#FBBF24",
        danger: "#F87171",
      },
      fontFamily: {
        sans: ["var(--font-body)", "Segoe UI", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Segoe UI", "system-ui", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
