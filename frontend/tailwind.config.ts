import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f8f9ff",
        "on-background": "#0b1c30",
        surface: "#f8f9ff",
        "surface-dim": "#cbdbf5",
        "surface-bright": "#f8f9ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#eff4ff",
        "surface-container": "#e5eeff",
        "surface-container-high": "#dce9ff",
        "surface-container-highest": "#d3e4fe",
        "surface-variant": "#d3e4fe",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#464555",
        "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff",
        outline: "#777587",
        "outline-variant": "#c7c4d8",
        "surface-tint": "#4d44e3",
        primary: "#3525cd",
        "on-primary": "#ffffff",
        "primary-container": "#4f46e5",
        "on-primary-container": "#dad7ff",
        "inverse-primary": "#c3c0ff",
        secondary: "#585f67",
        "on-secondary": "#ffffff",
        "secondary-container": "#dce3ec",
        "on-secondary-container": "#5e656d",
        tertiary: "#005338",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#006e4b",
        "on-tertiary-container": "#67f4b7",
        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",
        "primary-fixed": "#e2dfff",
        "primary-fixed-dim": "#c3c0ff",
        "on-primary-fixed": "#0f0069",
        "on-primary-fixed-variant": "#3323cc"
      },
      fontFamily: {
        sans: ["var(--font-noto-thai)", "Noto Sans Thai", "Noto Sans", "system-ui", "sans-serif"]
      },
      fontSize: {
        "display-lg": ["48px", { lineHeight: "1.2", fontWeight: "700" }],
        "headline-lg": ["32px", { lineHeight: "1.3", fontWeight: "700" }],
        "headline-lg-mobile": ["28px", { lineHeight: "1.3", fontWeight: "700" }],
        "headline-md": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.6", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "1.4", fontWeight: "500" }],
        "label-sm": ["12px", { lineHeight: "1.2", fontWeight: "600" }]
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.5rem",
        full: "9999px"
      },
      boxShadow: {
        ambient: "0 4px 20px rgba(0, 0, 0, 0.05)"
      },
      spacing: {
        sidebar: "280px",
        topbar: "72px"
      },
      maxWidth: {
        app: "1440px"
      }
    }
  },
  plugins: []
};

export default config;
