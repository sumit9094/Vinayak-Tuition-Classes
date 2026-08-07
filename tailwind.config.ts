import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brandBlue: "#0F8BFD",   // Dodger blue (Apna College Primary)
        skyBlue: "#e0f2fe",     // Soft sky blue background
        lightCyan: "#cffafe",   // Soft cyan
        softOrange: "#fdba74",  // Soft orange highlights
        pureWhite: "#ffffff",
        darkObsidian: "#090a0f",
        darkCard: "#0f131f",
        accentViolet: "#0F8BFD", // Map violet elements to Dodger Blue
        accentCyan: "#00d2ff",   // Map cyan elements to vibrant electric cyan
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "blob": "blob 10s infinite",
        "float": "float 8s ease-in-out infinite",
      },
      keyframes: {
        blob: {
          "0%": {
            transform: "translate(0px, 0px) scale(1)",
          },
          "33%": {
            transform: "translate(50px, -50px) scale(1.1)",
          },
          "66%": {
            transform: "translate(-30px, 40px) scale(0.9)",
          },
          "100%": {
            transform: "translate(0px, 0px) scale(1)",
          },
        },
        float: {
          "0%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-15px)",
          },
          "100%": {
            transform: "translateY(0)",
          },
        }
      },
    },
  },
  plugins: [],
};
export default config;
