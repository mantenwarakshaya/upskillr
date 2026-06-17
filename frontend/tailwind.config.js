/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#60A5FA",
        background: "#F8FAFC",
        card: "#FFFFFF",
        "text-dark": "#0F172A",
        "text-secondary": "#475569",
        border: "#E2E8F0",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(15, 23, 42, 0.08)",
        focus: "0 0 0 4px rgba(37, 99, 235, 0.12)",
      },
      borderRadius: {
        ui: "0.5rem",
      },
    },
  },
  plugins: [],
};