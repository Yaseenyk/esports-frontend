import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/app/**/*.{ts,tsx}", "./src/components/**/*.{ts,tsx}", "./src/lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // streamerOS Signal Kit, same tokens as the other sites.
        ink: "#05070A",
        cyan: { DEFAULT: "#22D3EE", 400: "#22D3EE", 500: "#22D3EE", 900: "#164e63" },
        purple: { DEFAULT: "#A855F7", 400: "#A855F7", 500: "#A855F7" },
      },
      fontFamily: {
        sans: ["Segoe UI", "system-ui", "-apple-system", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
        mono: ["ui-monospace", "SFMono-Regular", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
