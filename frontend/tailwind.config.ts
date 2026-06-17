import type { Config } from "tailwindcss";

// "The Source Desk" — Linear/Vercel-clean, document-grounded study workspace.
// Neutrals carry the page; iris is the single interactive accent; amber ("mark")
// is reserved exclusively for source citations — the signature. Borders over shadows.
// Semantic (Material-3) names are kept so existing class references keep working;
// only the values changed.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#FBFCFD",
        "on-background": "#15181D",
        surface: "#FBFCFD",
        "surface-dim": "#EEF0F2",
        "surface-bright": "#FFFFFF",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#F6F7F9",
        "surface-container": "#F1F2F4",
        "surface-container-high": "#E9EBEE",
        "surface-container-highest": "#E3E5E9",
        "surface-variant": "#F1F2F4",
        "on-surface": "#15181D",
        "on-surface-variant": "#5C636E",
        "inverse-surface": "#15181D",
        "inverse-on-surface": "#F6F7F9",
        outline: "#C2C7CE",
        "outline-variant": "#E4E7EB",
        "surface-tint": "#5A4FE0",
        // iris — the single interactive accent
        primary: "#5A4FE0",
        "primary-hover": "#4A41C9",
        "on-primary": "#FFFFFF",
        "primary-container": "#ECEBFC",
        "on-primary-container": "#2A2480",
        "inverse-primary": "#C7C3F5",
        secondary: "#5C636E",
        "on-secondary": "#FFFFFF",
        "secondary-container": "#EEF0F2",
        "on-secondary-container": "#2B3038",
        tertiary: "#0E9F6E",
        "on-tertiary": "#FFFFFF",
        "tertiary-container": "#E5F6EF",
        "on-tertiary-container": "#0A5C42",
        // mark — citations / source highlights ONLY
        "accent-warm": "#C97A0E",
        "accent-warm-container": "#FCEFCD",
        "on-accent-warm-container": "#7A5200",
        success: "#0E9F6E",
        "success-container": "#E5F6EF",
        "on-success-container": "#0A5C42",
        warning: "#C97A0E",
        "warning-container": "#FCEFCD",
        "on-warning-container": "#7A5200",
        info: "#2563EB",
        "info-container": "#E5EDFC",
        "on-info-container": "#1E3A8A",
        error: "#E5484D",
        "on-error": "#FFFFFF",
        "error-container": "#FCE9E9",
        "on-error-container": "#A11D21",
        "primary-fixed": "#ECEBFC",
        "primary-fixed-dim": "#A9A4F0",
        "on-primary-fixed": "#1B1670",
        "on-primary-fixed-variant": "#3A32B0"
      },
      fontFamily: {
        sans: ["var(--font-noto-thai)", "Noto Sans Thai", "Noto Sans", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"]
      },
      fontSize: {
        "display-lg": ["34px", { lineHeight: "1.15", letterSpacing: "-0.021em", fontWeight: "600" }],
        "headline-lg": ["26px", { lineHeight: "1.2", letterSpacing: "-0.018em", fontWeight: "600" }],
        "headline-lg-mobile": ["23px", { lineHeight: "1.2", letterSpacing: "-0.015em", fontWeight: "600" }],
        "headline-md": ["19px", { lineHeight: "1.3", letterSpacing: "-0.012em", fontWeight: "600" }],
        "body-lg": ["17px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["15px", { lineHeight: "1.55", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "1.4", fontWeight: "500" }],
        "label-sm": ["12.5px", { lineHeight: "1.3", letterSpacing: "0.01em", fontWeight: "500" }]
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.625rem",
        lg: "0.875rem",
        xl: "1.25rem",
        full: "9999px"
      },
      boxShadow: {
        // borders do the structural work; shadows are near-invisible except for overlays
        ambient: "0 1px 2px rgba(20, 24, 29, 0.04)",
        card: "0 1px 1px rgba(20, 24, 29, 0.03)",
        control: "0 1px 1px rgba(20, 24, 29, 0.04)",
        elevated: "0 12px 32px -8px rgba(20, 24, 29, 0.16), 0 1px 2px rgba(20, 24, 29, 0.08)"
      },
      spacing: {
        sidebar: "264px",
        topbar: "60px"
      },
      maxWidth: {
        app: "1280px"
      }
    }
  },
  plugins: []
};

export default config;
