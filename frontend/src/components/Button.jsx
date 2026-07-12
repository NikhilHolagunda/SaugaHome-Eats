// Button.jsx — Shared button used everywhere in the app.
// Signature interaction: a soft diagonal light sweep on hover, a gentle lift,
// and a tactile press-down on click. Keeps every CTA in the app feeling
// like part of the same, deliberately designed product.
import { Link } from 'react-router-dom';

const VARIANTS = {
  primary:
    'bg-coral text-white shadow-md hover:shadow-[0_14px_30px_-10px_rgba(249,97,103,0.55)] hover:-translate-y-0.5',
  secondary:
    'bg-white text-navy border-2 border-navy hover:bg-navy hover:text-white',
  ghost:
    'bg-transparent text-navy hover:bg-navy/5',
};

export default function Button({
  children,
  to,
  href,
  onClick,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled = false,
  ...rest
}) {
  const classes = `btn-shine relative inline-flex items-center justify-center gap-2 font-semibold rounded-lg px-6 py-3 transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 disabled:hover:translate-y-0 ${VARIANTS[variant]} ${className}`;

  if (to && !disabled) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }
  if (href && !disabled) {
    return (
      <a href={href} className={classes} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} {...rest}>
      {children}
    </button>
  );
}