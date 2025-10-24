/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#212529",
        secondary: "#333333",
        base: "#002D51",
      },
      screens: {
        xsm: { max: "500px" },
        sm: { min: "501px", max: "999px" },
        md: {
          min: "1000px",
          max: "1200px",
        },
        lg: {
          min: "1201px",
        },
        xl: {
          min: "1450px",
        },
      },
      fontFamily: {
        ppagrandir: ["var(--font-ppagrandir)"],
        roboto: ["Roboto", "serif"],
      },
    },
  },
  plugins: [],
};
