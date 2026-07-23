// Reveal.jsx — wraps children in a scroll-triggered fade/slide-up entrance.
// Thin wrapper around useRevealOnScroll so call sites stay simple:
//   <Reveal><ReviewCard ... /></Reveal>
import useRevealOnScroll from '../hooks/useRevealOnScroll';

export default function Reveal({ children, delay = 0, as: Tag = 'div', className = '' }) {
  const [ref, isVisible] = useRevealOnScroll();
  return (
    <Tag
      ref={ref}
      className={`reveal-on-scroll ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: isVisible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </Tag>
  );
}