import localFont from "next/font/local";

/** Poster and app-pass type, served from src/fonts (no network at build). Loaded for the ID card tool only. */
const poppins = localFont({
  src: [
    { path: "../../fonts/poppins-300-normal.woff2", weight: "300", style: "normal" },
    { path: "../../fonts/poppins-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../fonts/poppins-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../fonts/poppins-600-normal.woff2", weight: "600", style: "normal" },
    { path: "../../fonts/poppins-700-normal.woff2", weight: "700", style: "normal" },
    { path: "../../fonts/poppins-800-normal.woff2", weight: "800", style: "normal" },
    { path: "../../fonts/poppins-500-italic.woff2", weight: "500", style: "italic" },
    { path: "../../fonts/poppins-600-italic.woff2", weight: "600", style: "italic" },
  ],
  variable: "--font-poppins", display: "swap",
});
const anton = localFont({ src: [{ path: "../../fonts/anton-400-normal.woff2", weight: "400", style: "normal" }], variable: "--font-anton", display: "swap" });
const bebas = localFont({ src: [{ path: "../../fonts/bebas-neue-400-normal.woff2", weight: "400", style: "normal" }], variable: "--font-bebas", display: "swap" });
const oswald = localFont({ src: [{ path: "../../fonts/oswald-200-700-normal.woff2", weight: "200 700", style: "normal" }], variable: "--font-oswald", display: "swap" });
const montserrat = localFont({
  src: [
    { path: "../../fonts/montserrat-100-900-normal.woff2", weight: "100 900", style: "normal" },
    { path: "../../fonts/montserrat-100-900-italic.woff2", weight: "100 900", style: "italic" },
  ],
  variable: "--font-montserrat", display: "swap",
});

export const cardFontVars = [poppins, anton, bebas, oswald, montserrat].map((f) => f.variable).join(" ");
