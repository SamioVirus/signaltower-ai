/**
 * Tailwind reads the semantic tokens defined in `src/styles.css`, so a class
 * like `bg-surface` resolves correctly in both themes with no `dark:` variant
 * at the call site. Only genuinely theme-specific treatments need `dark:`.
 */
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: token("canvas"),
        surface: {
          DEFAULT: token("surface"),
          raised: token("surface-raised"),
          sunken: token("surface-sunken"),
        },
        subtle: token("border-subtle"),
        strong: token("border-strong"),
        primary: token("text-primary"),
        secondary: token("text-secondary"),
        muted: token("text-muted"),
        inverted: token("text-inverted"),
        accent: {
          DEFAULT: token("accent"),
          hover: token("accent-hover"),
          solid: token("accent-solid"),
          "solid-hover": token("accent-solid-hover"),
          soft: token("accent-soft"),
          border: token("accent-border"),
          text: token("accent-text"),
        },
        ok: {
          DEFAULT: token("ok"),
          soft: token("ok-soft"),
          text: token("ok-text"),
        },
        warn: {
          DEFAULT: token("warn"),
          soft: token("warn-soft"),
          text: token("warn-text"),
        },
        risk: {
          DEFAULT: token("risk"),
          soft: token("risk-soft"),
          text: token("risk-text"),
        },
        info: {
          DEFAULT: token("info"),
          soft: token("info-soft"),
          text: token("info-text"),
        },
        "on-accent": token("on-accent"),
        neutral: {
          DEFAULT: token("neutral"),
          soft: token("neutral-soft"),
          text: token("neutral-text"),
        },
      },
      borderColor: {
        DEFAULT: token("border-subtle"),
      },
      boxShadow: {
        card: "var(--shadow-card)",
        raised: "var(--shadow-raised)",
      },
      fontFamily: {
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "monospace",
        ],
      },
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],
      },
      maxWidth: {
        content: "94rem",
      },
    },
  },
  plugins: [],
};
