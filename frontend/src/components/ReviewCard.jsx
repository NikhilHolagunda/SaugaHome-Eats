// ReviewCard.jsx — US-15: displays a single review on the seller detail page.
import StarRating from './StarRating';

function relativeTime(iso) {
  const then = new Date(iso.replace(' ', 'T') + 'Z'); // SQLite CURRENT_TIMESTAMP is UTC, no offset
  const diffMs = Date.now() - then.getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

export default function ReviewCard({ review }) {
  return (
    <div className="bg-white border border-border rounded-xl p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <StarRating value={review.rating} readOnly size="text-sm" />
          <span className="text-sm font-semibold text-navy">{review.buyer_name || 'A buyer'}</span>
        </div>
        <span className="text-xs text-text-muted whitespace-nowrap">{relativeTime(review.created_at)}</span>
      </div>
      {review.review_text && (
        <p className="text-sm text-text-dark leading-relaxed">{review.review_text}</p>
      )}
    </div>
  );
}