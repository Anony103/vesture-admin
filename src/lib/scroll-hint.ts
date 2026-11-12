/**
 * Scrollbars appear only while something scrolls. This marks whatever is scrolling (the page or a box inside it) with a
 * data-scrolling attribute and takes it off a moment after the scrolling stops; the styles in index.css do the rest.
 */
const HIDE_AFTER_MS = 900;
const timers = new WeakMap<Element, number>();

export const initScrollHint = () => {
  document.addEventListener(
    "scroll",
    (event) => {
      // the page itself reports the document; show its bar on the root element
      const target = event.target === document ? document.documentElement : event.target;
      if (!(target instanceof Element)) return;
      target.setAttribute("data-scrolling", "");
      window.clearTimeout(timers.get(target));
      timers.set(
        target,
        window.setTimeout(() => target.removeAttribute("data-scrolling"), HIDE_AFTER_MS)
      );
    },
    // scroll events do not bubble, so listen in the capture phase to hear every scrolling box
    { capture: true, passive: true }
  );
};
