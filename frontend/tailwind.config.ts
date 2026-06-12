import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#f7f8fb",
        "on-background": "#0b1c30",
        surface: "#f7f8fb",
        "surface-dim": "#d7dee8",
        "surface-bright": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1f4f8",
        "surface-container": "#e8edf5",
        "surface-container-high": "#dfe7f1",
        "surface-container-highest": "#d4deea",
        "surface-variant": "#d4deea",
        "on-surface": "#0b1c30",
        "on-surface-variant": "#3f4b5f",
        "inverse-surface": "#213145",
        "inverse-on-surface": "#eaf1ff",
        outline: "#6b7484",
        "outline-variant": "#c8d0dc",
        "surface-tint": "#3830b2",
        primary: "#3026a8",
        "primary-hover": "#251d86",
        "on-primary": "#ffffff",
        "primary-container": "#e5e3ff",
        "on-primary-container": "#17105f",
        "inverse-primary": "#cbc8ff",
        secondary: "#525c6b",
        "on-secondary": "#ffffff",
        "secondary-container": "#dfe6ef",
        "on-secondary-container": "#28313d",
        tertiary: "#105c44",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#dff6ec",
        "on-tertiary-container": "#0b3d2d",
        "accent-warm": "#b87516",
        "accent-warm-container": "#fff1d6",
        "on-accent-warm-container": "#5e3a00",
        success: "#146c43",
        "success-container": "#dff6ec",
        "on-success-container": "#0b3d2d",
        warning: "#9a6400",
        "warning-container": "#fff1d6",
        "on-warning-container": "#5e3a00",
        info: "#22577a",
        "info-container": "#e3f2fd",
        "on-info-container": "#12384f",
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
        ambient: "0 4px 20px rgba(0, 0, 0, 0.05)",
        card: "0 1px 2px rgba(11, 28, 48, 0.06)",
        control: "0 1px 2px rgba(11, 28, 48, 0.08)",
        elevated: "0 10px 24px rgba(11, 28, 48, 0.1)"
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
