// OrderTrackingPage.jsx — US-11: buyer (or seller) view of a single order's live status.
// Accessible to whichever party (buyer or seller) owns the order; the backend enforces that.
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderByIdApi, photoUrl, submitReviewApi } from '../api';
import { getToken, isBuyer } from '../auth';
import OrderStatusTimeline from '../components/OrderStatusTimeline';
import DeliveryMap from '../components/DeliveryMap';
import StarRating from '../components/StarRating';

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('en-CA', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

// US-15 — shown only to the buyer, only once the order is Delivered.
// order.review comes pre-attached from GET /api/orders/:id, so a page refresh
// (or the 5s poll) always reflects whether a review already exists.
function ReviewSection({ order, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (order.status !== 'Delivered' || !isBuyer()) return null;

  if (order.review) {
    return (
      <div className="bg-white border border-border rounded-xl shadow-soft p-6 mb-6">
        <h2 className="font-serif text-lg font-bold text-navy mb-3">Your Review</h2>
        <StarRating value={order.review.rating} readOnly />
        {order.review.review_text && (
          <p className="text-sm text-text-dark mt-3 leading-relaxed">{order.review.review_text}</p>
        )}
      </div>
    );
  }

  async function handleSubmit() {
    setError('');
    if (rating < 1) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    try {
      const review = await submitReviewApi(getToken(), {
        order_id: order.id,
        rating,
        review_text: text.trim() || undefined,
      });
      onSubmitted(review);
    } catch (err) {
      setError(err.message || 'Could not submit your review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bg-white border border-border rounded-xl shadow-soft p-6 mb-6">
      <h2 className="font-serif text-lg font-bold text-navy mb-3">How was your order?</h2>
      <StarRating value={rating} onChange={setRating} size="text-3xl" />
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Tell other buyers what you thought (optional)"
        rows={3}
        className="w-full mt-4 p-3 border border-border rounded-lg bg-white text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-coral/50 resize-none"
      />
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-4 bg-coral text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>
    </div>
  );
}

export default function OrderTrackingPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback((showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setRefreshing(true);
    getOrderByIdApi(getToken(), id)
      .then(data => {
        setOrder(data);
        setError('');
      })
      .catch(err => setError(err.message || 'Could not load this order.'))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  // Poll every 5 seconds so a buyer sees seller status updates without a manual refresh.
  useEffect(() => {
    const interval = setInterval(() => load(false), 5000);
    return () => clearInterval(interval);
  }, [load]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="skeleton h-8 w-1/2 mb-6" />
        <div className="skeleton h-24 w-full mb-6" />
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="font-serif text-3xl font-bold text-navy mb-2">Can't show this order</h1>
        <p className="text-text-muted mb-6">{error}</p>
        <Link to="/" className="bg-coral text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-500 transition-colors inline-block">
          Back to home
        </Link>
      </div>
    );
  }

  if (!order) return null;

  const items = order.items || [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 w-full">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-1">
            Order #{order.id}
          </h1>
          <p className="text-text-muted text-sm">Placed {formatDate(order.created_at)}</p>
        </div>
        <button
          type="button"
          onClick={() => load(false)}
          disabled={refreshing}
          className="text-sm font-semibold text-navy border-2 border-navy rounded-lg px-4 py-2 hover:bg-navy hover:text-white transition disabled:opacity-50 shrink-0"
        >
          {refreshing ? 'Refreshing…' : 'Refresh status'}
        </button>
      </div>

      {/* Status timeline (US-11) */}
      <div className="bg-white border border-border rounded-xl shadow-soft p-6 mb-6">
        <h2 className="font-serif text-lg font-bold text-navy mb-6">Order Status</h2>
        <OrderStatusTimeline status={order.status} />
        {order.status_updated_at && (
          <p className="text-xs text-text-muted text-center mt-6">
            Last updated {formatDate(order.status_updated_at)}
          </p>
        )}
      </div>

      {/* Delivery map (US-12 + US-13) */}
      {order.status !== 'Declined' && (
        <div className="bg-white border border-border rounded-xl shadow-soft p-6 mb-6">
          <h2 className="font-serif text-lg font-bold text-navy mb-4">Delivery Route</h2>
          <DeliveryMap
            sellerLat={order.seller_lat}
            sellerLng={order.seller_lng}
            buyerLat={order.buyer_lat}
            buyerLng={order.buyer_lng}
            status={order.status}
          />
          {order.status === 'Out for Delivery' && (
            <p className="text-xs text-text-muted text-center mt-3">
              🛵 Your delivery is on the way — this is a simulated progress indicator, not live GPS.
            </p>
          )}
        </div>
      )}

      {/* Seller info */}
      <div className="bg-white border border-border rounded-xl shadow-soft p-6 mb-6">
        <h2 className="font-serif text-lg font-bold text-navy mb-4">From</h2>
        <Link to={`/seller/${order.seller?.id}`} className="flex items-center gap-4 group">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 shrink-0">
            {order.seller?.photo_url ? (
              <img src={photoUrl(order.seller.photo_url)} alt={order.seller.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
            )}
          </div>
          <div>
            <p className="font-semibold text-navy group-hover:text-coral transition-colors">
              {order.seller?.name || 'Seller'}
            </p>
            <p className="text-sm text-text-muted">{order.seller?.cuisine} · {order.seller?.neighbourhood}</p>
          </div>
        </Link>
      </div>

      {/* Order items */}
      <div className="bg-white border border-border rounded-xl shadow-soft p-6 mb-6">
        <h2 className="font-serif text-lg font-bold text-navy mb-4">Items</h2>
        <ul className="space-y-2 mb-4">
          {items.map(it => (
            <li key={it.id} className="flex justify-between text-sm">
              <span className="text-text-dark">{it.quantity} × {it.item_name}</span>
              <span className="text-text-muted">${(Number(it.unit_price) * it.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        {order.notes && (
          <div className="bg-cream border border-border rounded-lg p-3 mb-4">
            <p className="text-xs font-semibold text-navy mb-1">Your note</p>
            <p className="text-sm text-text-dark">{order.notes}</p>
          </div>
        )}
        <div className="flex justify-between font-bold text-navy border-t border-border pt-3">
          <span>Total</span>
          <span>${Number(order.total_price).toFixed(2)}</span>
        </div>
      </div>

      {/* Review (US-15) */}
      <ReviewSection
        order={order}
        onSubmitted={review => setOrder(prev => ({ ...prev, review }))}
      />
    </div>
  );
}