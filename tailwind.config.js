export default {
    content: ["./index.html", "./src/**/*.{ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
            },
            colors: {
                "theme-background": "#202020",
                "theme-background-soft": "#17181d",
                "theme-surface": "#101116",
                "theme-surface-raised": "#161923",
                "theme-surface-muted": "#0c0d12",
                "theme-accent": "#1687e8",
                "theme-accent-strong": "#48adff",
                "theme-accent-muted": "#0f2a45",
                "theme-text": "#f4f7fb",
                "theme-text-muted": "#8f9baa",
                "theme-text-dim": "#566272",
                "theme-border": "#282c35",
                "theme-border-strong": "#1687e8",
                "theme-danger": "#ff5364",
            },
            boxShadow: {
                card: "0 18px 45px rgba(0, 0, 0, 0.42)",
                subtle: "0 10px 26px rgba(0, 0, 0, 0.34)",
            },
        },
    },
    plugins: [],
};
