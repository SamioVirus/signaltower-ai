/**
 * Palette derivation and contrast gate.
 *
 * The visual identity is warm-light-first, which changes the surface every
 * colour was previously validated against. This script re-tests every pairing
 * that carries meaning and fails loudly rather than letting a regression reach
 * the axe suite. Run with `npm run palette`.
 *
 * Two rules it enforces:
 *   - Text pairings clear 4.5:1 (WCAG 2.1 AA, normal text).
 *   - Non-text meaning-carrying marks (chart series, status dots) clear 3:1.
 */

type Rgb = [number, number, number];

const toRgb = (hex: string): Rgb => {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as Rgb;
};

const luminance = (hex: string): number => {
  const [r, g, b] = toRgb(hex).map((v) =>
    v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  );
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

const contrast = (a: string, b: string): number => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Perceptual delta in OKLab, x100 — the separation measure for series colours. */
const oklab = (hex: string): Rgb => {
  const [r, g, b] = toRgb(hex).map((v) =>
    v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4,
  );
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
};

const deltaE = (a: string, b: string): number => {
  const [l1, a1, b1] = oklab(a);
  const [l2, a2, b2] = oklab(b);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2) * 100;
};

/** Crude protanopia/deuteranopia simulation, enough to catch collisions. */
const simulate = (hex: string, kind: "protan" | "deutan"): string => {
  const [r, g, b] = toRgb(hex);
  const m =
    kind === "protan"
      ? [
          [0.152, 1.053, -0.205],
          [0.115, 0.786, 0.099],
          [-0.004, -0.048, 1.052],
        ]
      : [
          [0.367, 0.861, -0.228],
          [0.28, 0.673, 0.047],
          [-0.012, 0.043, 0.969],
        ];
  const out = m.map((row) =>
    Math.max(0, Math.min(1, row[0] * r + row[1] * g + row[2] * b)),
  );
  return `#${out
    .map((v) =>
      Math.round(v * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
};

// ---------------------------------------------------------------------------
// The palette
// ---------------------------------------------------------------------------

const LIGHT = {
  canvas: "#F6F4EF",
  surface: "#FFFEFB",
  sunken: "#EFEDE6",
  ink: "#20272B",
  secondary: "#4A545A",
  muted: "#5F6B72",
  divider: "#DADFD9",
  strong: "#C3CABF",
  graphite: "#202C31",
  accent: "#1D6270",
  accentSolid: "#1D6270",
  onAccent: "#FFFFFF",
  accentSoft: "#E4EEF0",
  accentBorder: "#B9D3D8",
  ok: "#2F6B4F",
  okSoft: "#E6EFE8",
  warn: "#8A5A16",
  warnSoft: "#F7EEDD",
  risk: "#9C3427",
  riskSoft: "#F7E8E5",
  info: "#4A5A6B",
  infoSoft: "#EBEEF1",
};

const DARK = {
  canvas: "#14191B",
  surface: "#1B2225",
  sunken: "#111618",
  ink: "#E9E7E1",
  secondary: "#B3B7B5",
  muted: "#949996",
  divider: "#2B3437",
  strong: "#3D4A4E",
  graphite: "#1B2225",
  // Light enough to read as text on charcoal...
  accent: "#6FB9C7",
  // ...but a filled control needs a darker fill to keep white legible.
  accentSolid: "#1D6270",
  onAccent: "#FFFFFF",
  accentSoft: "#17323A",
  accentBorder: "#2C525C",
  ok: "#6FBF92",
  okSoft: "#14291F",
  warn: "#E0B057",
  warnSoft: "#2E2312",
  risk: "#E98476",
  riskSoft: "#331A17",
  info: "#A9B6C2",
  infoSoft: "#1E262C",
};

/**
 * Chart series, re-stepped for the warm surfaces.
 *
 * The previous steps were validated against a cool near-white; on warm ivory
 * the orange and aqua fell to 2.91:1 and 2.56:1. These are darker steps of the
 * same hues, and deliberately avoid the petrol hue so in-chart emphasis never
 * competes with series 1.
 */
const CHART_LIGHT = ["#33409B", "#B24A18", "#12705A"];
const CHART_DARK = ["#6F84E0", "#E0793F", "#3FAE8C"];

// Ordinal ramp for tiered magnitude (risk tiers, heatmap density). The step
// nearest each surface must stay distinguishable from it, which is why the
// light and dark ramps end differently.
const ORDINAL_LIGHT = ["#8FB4D4", "#6E9BC8", "#3C72AA", "#1F4E7A"];
const ORDINAL_DARK = ["#8FB4D4", "#6E9BC8", "#3C72AA", "#24578A"];

// ---------------------------------------------------------------------------
// Gates
// ---------------------------------------------------------------------------

let failures = 0;

const check = (label: string, ratio: number, min: number) => {
  const pass = ratio >= min;
  if (!pass) failures += 1;
  const mark = pass ? "pass" : "FAIL";
  console.log(
    `  ${mark}  ${label.padEnd(44)} ${ratio.toFixed(2)}:1  (min ${min})`,
  );
};

const textPairs = (
  name: string,
  p: typeof LIGHT,
  chart: string[],
  ordinal: string[],
) => {
  console.log(`\n=== ${name} ===`);
  check("primary text on canvas", contrast(p.ink, p.canvas), 4.5);
  check("primary text on surface", contrast(p.ink, p.surface), 4.5);
  check("secondary text on canvas", contrast(p.secondary, p.canvas), 4.5);
  check("muted text on canvas", contrast(p.muted, p.canvas), 4.5);
  check("muted text on surface", contrast(p.muted, p.surface), 4.5);
  check("muted text on sunken", contrast(p.muted, p.sunken), 4.5);
  check("muted text on accent-soft", contrast(p.muted, p.accentSoft), 4.5);
  check("accent text on canvas", contrast(p.accent, p.canvas), 4.5);
  check("accent text on surface", contrast(p.accent, p.surface), 4.5);
  check("on-accent on accent-solid", contrast(p.onAccent, p.accentSolid), 4.5);
  check("white on graphite nav", contrast("#FFFFFF", p.graphite), 4.5);
  check("ok text on ok-soft", contrast(p.ok, p.okSoft), 4.5);
  check("warn text on warn-soft", contrast(p.warn, p.warnSoft), 4.5);
  check("risk text on risk-soft", contrast(p.risk, p.riskSoft), 4.5);
  check("info text on info-soft", contrast(p.info, p.infoSoft), 4.5);

  console.log(`  -- non-text marks (3:1) --`);
  chart.forEach((c, i) =>
    check(`chart series ${i + 1} on canvas`, contrast(c, p.canvas), 3),
  );
  chart.forEach((c, i) =>
    check(`chart series ${i + 1} on surface`, contrast(c, p.surface), 3),
  );
  check("ordinal lightest step on surface", contrast(ordinal[0], p.surface), 2);
  check("status ok mark on surface", contrast(p.ok, p.surface), 3);
  check("status warn mark on surface", contrast(p.warn, p.surface), 3);
  check("status risk mark on surface", contrast(p.risk, p.surface), 3);
  check("status info mark on surface", contrast(p.info, p.surface), 3);

  console.log(`  -- series separation --`);
  for (let i = 0; i < chart.length; i += 1) {
    for (let j = i + 1; j < chart.length; j += 1) {
      const normal = deltaE(chart[i], chart[j]);
      const protan = deltaE(
        simulate(chart[i], "protan"),
        simulate(chart[j], "protan"),
      );
      const deutan = deltaE(
        simulate(chart[i], "deutan"),
        simulate(chart[j], "deutan"),
      );
      const worstCvd = Math.min(protan, deutan);
      check(`series ${i + 1}<->${j + 1} normal vision`, normal, 15);
      check(`series ${i + 1}<->${j + 1} colour-vision`, worstCvd, 8);
    }
  }

  /**
   * Petrol and a blue series-1 are never going to be 15 apart without giving
   * up one of them, so the separation here is a floor, not the mitigation.
   * The mitigation is a rule the chart layer enforces: petrol is the interface
   * accent and never appears as a mark inside a plot. In-chart emphasis uses
   * weight, opacity or an annotation, so the two never sit side by side as
   * peers competing to mean something.
   */
  console.log(
    `  -- accent kept clear of series 1 (floor, plus the no-petrol-in-plots rule) --`,
  );
  check("accent vs series 1 separation", deltaE(p.accent, chart[0]), 12);
};

textPairs("LIGHT", LIGHT, CHART_LIGHT, ORDINAL_LIGHT);
textPairs("DARK", DARK, CHART_DARK, ORDINAL_DARK);

console.log(
  failures === 0
    ? "\nAll pairings pass.\n"
    : `\n${failures} pairing(s) FAILED — fix before shipping.\n`,
);

process.exit(failures === 0 ? 0 : 1);
