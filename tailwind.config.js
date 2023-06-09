/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    colors: {
      white: "#f0f0f0",
      "white-hover": "#c2c7cc",
      "placeholder-dark": "#636362",
      dark: "#2e2e2e",
      "dark-background2": "#222333",
      "dark-background": "#1b1b2b",
      "light-background2": "#f0f0f0",
      "light-background": "#e3e3e3",
      /* yellow: "#ff0000", */
      primary: "#fbb03b",
      plight: "#fbbf62",
      pdark: "#af7b29",
      secondary: "#338dc9",
      slight: "#0071bc",
      sdark: "#004f83",
      "pdark-hover": "#af7b2939",
      "p2dark-hover": "#af7b2970",
      "plight-hover": "#fbbf6239",
      "p2light-hover": "#fbbf6270",
      "dark-drawer-background": "#222222ce",
      "light-drawer-background": "#e3e3e3ce",
      error: "#CC0000",
      "l-error": "#e15454",
      warning: "#FF8800",
      success: "#007733",
      info: "#0099CC",
    },
    extend: {
      minHeight: {
        m10: "2.5rem",
      },
      minWidth: {
        m10: "2.5rem",
      },
    },
  },
  plugins: [],
};
