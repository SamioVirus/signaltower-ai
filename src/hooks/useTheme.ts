import { useCallback, useEffect, useState } from "react";

export type ThemePreference = "light" | "dark" | "system";

const STORAGE_KEY = "signaltower.theme";

const prefersDark = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-color-scheme: dark)").matches === true;

const readStored = (): ThemePreference => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system")
      return stored;
  } catch {
    // Private browsing or blocked storage: fall back to the system setting.
  }
  return "system";
};

const apply = (preference: ThemePreference): void => {
  const dark =
    preference === "dark" || (preference === "system" && prefersDark());
  document.documentElement.classList.toggle("dark", dark);
};

/**
 * Theme preference with a real "system" option.
 *
 * Defaulting to the operating system and remembering an explicit override is
 * the behaviour people expect; a toggle that ignores the system setting reads
 * as an oversight.
 */
export const useTheme = () => {
  const [preference, setPreference] = useState<ThemePreference>(readStored);

  useEffect(() => {
    apply(preference);
    try {
      localStorage.setItem(STORAGE_KEY, preference);
    } catch {
      // Not being able to persist the choice must not break the toggle.
    }
  }, [preference]);

  // Follow the system while the preference is "system".
  useEffect(() => {
    if (preference !== "system") return;
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => apply("system");
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [preference]);

  const isDark =
    preference === "dark" ||
    (preference === "system" && typeof window !== "undefined" && prefersDark());

  const cycle = useCallback(() => {
    setPreference((current) =>
      current === "light" ? "dark" : current === "dark" ? "system" : "light",
    );
  }, []);

  return { preference, setPreference, cycle, isDark };
};

/** Applied before React mounts so the first paint is already correct. */
export const initTheme = (): void => apply(readStored());
