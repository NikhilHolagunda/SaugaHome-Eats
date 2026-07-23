// useRevealOnScroll.js — tiny IntersectionObserver hook that adds the
// `is-visible` class (see .reveal-on-scroll in index.css) once an element
// scrolls into view. Used for below-the-fold content like menu items and
// reviews, where a mount-time animation would fire before the user ever sees it.
import { useEffect, useRef, useState } from 'react';

export default function useRevealOnScroll(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // If the browser doesn't support IntersectionObserver (very old browsers),
    // just show the content immediately rather than leaving it invisible.
    if (typeof IntersectionObserver === 'undefined') {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el); // animate once, not every scroll pass
        }
      },
      { threshold: 0.15, ...options }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options]);

  return [ref, isVisible];
}