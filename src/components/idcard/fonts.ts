import { Anton, Bebas_Neue, Montserrat, Oswald, Poppins } from "next/font/google";

/** Poster and app-pass type. They are loaded for the ID card tool only, so no other page pays for them. */
const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700", "800"], style: ["normal", "italic"], variable: "--font-poppins", display: "swap" });
const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--font-anton", display: "swap" });
const bebas = Bebas_Neue({ subsets: ["latin"], weight: "400", variable: "--font-bebas", display: "swap" });
const oswald = Oswald({ subsets: ["latin"], weight: ["500", "700"], variable: "--font-oswald", display: "swap" });
const montserrat = Montserrat({ subsets: ["latin"], weight: ["700", "800", "900"], style: ["normal", "italic"], variable: "--font-montserrat", display: "swap" });

export const cardFontVars = [poppins, anton, bebas, oswald, montserrat].map((f) => f.variable).join(" ");
