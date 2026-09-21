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
        graphite: token("graphite"),
        accent: {
          DEFAULT: token("accent"),
          hover: token("accent-hover"),
          solid: token("accent-solid"),
          "solid-hover": token("accent-solid-hover"),
          soft: token("accent-soft"),
          border: token("accent-border"),
          text: token("accent-text"),
        },
        "on-accent": token("on-accent"),
        ok: { DEFAULT: token("ok"), soft: token("ok-soft"), text: token("ok-text") },
        warn: { DEFAULT: token("warn"), soft: token("warn-soft"), text: token("warn-text") },
        risk: { DEFAULT: token("risk"), soft: token("risk-soft"), text: token("risk-text") },
        info: { DEFAULT: token("info"), soft: token("info-soft"), text: token("info-text") },
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
        // Working panels carry a hairline, not a shadow. Only floating things lift.
        panel: "var(--shadow-panel)",
        raised: "var(--shadow-raised)",
      },
      fontFamily: {
        display: ["Source Serif 4", "ui-serif", "Georgia", "serif"],
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
        /**
         * 11px is retired. The old `2xs` now resolves to 12px so any screen
         * not yet migrated gets the floor for free rather than staying
         * unreadable until someone remembers it.
         */
        "2xs": ["0.75rem", { lineHeight: "1rem" }],
        label: ["0.8125rem", { lineHeight: "1.125rem" }],
        /** Editorial display sizes, landing page only. */
        "display-sm": ["2.25rem", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
        display: ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-lg": ["4rem", { lineHeight: "1.02", letterSpacing: "-0.022em" }],
      },
      borderRadius: {
        control: "6px",
        panel: "8px",
        dialog: "12px",
      },
      spacing: {
        // The scale the layout is built on: 4 8 12 16 24 32 48 64.
        18: "4.5rem",
      },
      maxWidth: {
        content: "94rem",
        measure: "68ch",
      },
    },
  },
  plugins: [],
};
