import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/lib/**/*.{ts,tsx}", "./src/features/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: { short: { raw: "(max-height: 500px)" } }, // landscape phones: lets the studio shrink its sticky bars
      keyframes: {
        marquee: { to: { transform: "translateX(-50%)" } },
        float: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        drift: { "0%,100%": { transform: "translate(0,0) scale(1)" }, "50%": { transform: "translate(40px,-30px) scale(1.15)" } },
        sheen: { to: { backgroundPosition: "200% center" } },
        nudge: { from: { opacity: "0", transform: "translateY(0.5rem)" }, to: { opacity: "1", transform: "translateY(0)" } }, // the feedback hint: transform + opacity only
      },
      animation: { marquee: "marquee 38s linear infinite", float: "float 6s ease-in-out infinite", drift: "drift 16s ease-in-out infinite", sheen: "sheen 6s linear infinite", nudge: "nudge 300ms ease-out both" },
      zIndex: { dialog: "70", bubble: "65" }, // dialog: above the XP toast (z 60) and every page layer. bubble: the feedback button, above page overlays (z 50) and the toast, below the dialog
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
  plugins: [
    // `short:` = landscape phones (max-height 500px). A plugin variant, not a `screens` entry: object screens would break the max-sm: variants used in the app.
    ({ addVariant }: { addVariant: (name: string, def: string) => void }) => addVariant("short", "@media (max-height: 500px)"),
  ],
};

export default config;
