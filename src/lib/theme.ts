/**
 * The admin's colour theme. It opens dark; the switch in the top bar flips it and the choice is remembered in this browser.
 * index.html sets the theme before the first paint, so this module only has to keep the page and React in step afterwards.
 */
export type Theme = "dark" | "light";

const KEY = "vesture-admin-theme";
const listeners = new Set<() => void>();

const fromDocument = (): Theme =>
  typeof document !== "undefined" && document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";

let current: Theme = fromDocument();

const apply = (theme: Theme) => {
  const root = document.documentElement;
  root.setAttribute("data-theme", theme);
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
};

export const getTheme = (): Theme => current;

export const setTheme = (theme: Theme) => {
  current = theme;
  apply(theme);
  try {
    localStorage.setItem(KEY, theme);
  } catch {
    // private window or blocked storage: the choice just lasts until the tab is closed
  }
  listeners.forEach((listener) => listener());
};

export const toggleTheme = () => setTheme(current === "dark" ? "light" : "dark");

export const subscribeTheme = (listener: () => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};
