import { useEffect, useState } from "react";

const isDarkNow = (): boolean =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("dark");

/**
 * Whether the dark theme is currently applied.
 *
 * Charts need concrete colour values rather than CSS custom properties,
 * because `var()` is not resolved inside SVG presentation attributes. Watching
 * the class on the root element means a chart repaints on a theme change
 * without every chart having to subscribe to the theme hook itself.
 */
export const useIsDark = (): boolean => {
  const [isDark, setIsDark] = useState(isDarkNow);

  useEffect(() => {
    const observer = new MutationObserver(() => setIsDark(isDarkNow()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
};
