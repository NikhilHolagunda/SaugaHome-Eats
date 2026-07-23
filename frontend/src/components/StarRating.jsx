// StarRating.jsx — US-15 (input mode, for leaving a review) and
// US-16 (read-only display mode, for showing a seller's average rating).
import { useState } from 'react';

export default function StarRating({
  value = 0,
  onChange,
  readOnly = false,
  size = 'text-xl',
}) {
  const [hover, setHover] = useState(0);
  const isInteractive = !readOnly && typeof onChange === 'function';
  const displayValue = isInteractive && hover > 0 ? hover : value;

  return (
    <div className={`inline-flex gap-0.5 ${size}`} role={isInteractive ? 'radiogroup' : undefined}>
      {[1, 2, 3, 4, 5].map(star => {
        const filled = star <= Math.round(displayValue);
        return (
          <button
            key={star}
            type="button"
            disabled={!isInteractive}
            onClick={() => isInteractive && onChange(star)}
            onMouseEnter={() => isInteractive && setHover(star)}
            onMouseLeave={() => isInteractive && setHover(0)}
            className={[
              'leading-none transition-transform',
              isInteractive ? 'cursor-pointer hover:scale-110' : 'cursor-default',
              filled ? 'text-gold' : 'text-border',
            ].join(' ')}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}