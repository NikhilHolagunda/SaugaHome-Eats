// PersonalizedHomeBanner.jsx — logged-in-only section on the home page.
// Sellers see their real pending-order count and rating; buyers see their
// most recent order's live status. Renders nothing for logged-out visitors.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { isLoggedIn, isSeller, isBuyer, getSeller, getBuyer, getToken } from '../auth';
import { getSellerOrdersApi, getBuyerOrdersApi, getSellerByIdApi } from '../api';
import StarRating from './StarRating';
import Reveal from './Reveal';

const STATUS_STYLES = {
  Placed: 'bg-amber-50 text-amber-700',
  Accepted: 'bg-emerald-50 text-emerald-700',
  Declined: 'bg-red-50 text-red-700',
  Preparing: 'bg-blue-50 text-blue-700',
  'Out for Delivery': 'bg-purple-50 text-purple-700',
  Delivered: 'bg-green-100 text-green-900',
};

function SellerBanner() {
  const seller = getSeller();
  const [pendingCount, setPendingCount] = useState(null);
  const [rating, setRating] = useState(null);

  useEffect(() => {
    if (!seller?.id) return;
    getSellerOrdersApi(getToken())
      .then(orders => setPendingCount(orders.filter(o => o.status === 'Placed').length))
      .catch(() => setPendingCount(null));
    getSellerByIdApi(seller.id)
      .then(data => setRating({ avg: data.avg_rating, count: data.review_count }))
      .catch(() => setRating(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-white border border-border rounded-xl shadow-soft p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
      <div className="flex-1">
        <p className="font-serif text-xl font-bold text-navy mb-1">
          🍳 Welcome back{seller?.name ? `, ${seller.name}` : ''}
        </p>
        <p className="text-text-muted text-sm">Here's how your kitchen is doing today.</p>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-center">
          <p className="font-serif text-2xl font-bold text-coral">
            {pendingCount === null ? '–' : pendingCount}
          </p>
          <p className="text-xs text-text-muted">Pending order{pendingCount === 1 ? '' : 's'}</p>
        </div>
        <div className="text-center">
          {rating?.count > 0 ? (
            <>
              <div className="flex justify-center"><StarRating value={rating.avg} readOnly size="text-sm" /></div>
              <p className="text-xs text-text-muted mt-1">{rating.avg} ({rating.count})</p>
            </>
          ) : (
            <p className="text-xs text-text-muted">No reviews yet</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 shrink-0">
        <Link to="/seller/dashboard" className="text-sm font-semibold bg-coral text-white px-4 py-2.5 rounded-lg hover:bg-red-500 transition-colors">
          View Dashboard
        </Link>
        <Link to="/seller/edit-profile" className="text-sm font-semibold border-2 border-navy text-navy px-4 py-2.5 rounded-lg hover:bg-navy hover:text-white transition-colors">
          Edit Listing
        </Link>
      </div>
    </div>
  );
}

function BuyerBanner() {
  const buyer = getBuyer();
  const [lastOrder, setLastOrder] = useState(undefined); // undefined = loading, null = none found

  useEffect(() => {
    getBuyerOrdersApi(getToken())
      .then(orders => setLastOrder(orders[0] || null))
      .catch(() => setLastOrder(null));
  }, []);

  return (
    <div className="bg-white border border-border rounded-xl shadow-soft p-5 md:p-6 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
      <div className="flex-1">
        <p className="font-serif text-xl font-bold text-navy mb-1">
          👋 Welcome back{buyer?.name ? `, ${buyer.name}` : ''}
        </p>
        <p className="text-text-muted text-sm">
          {lastOrder === undefined
            ? 'Checking your recent orders…'
            : lastOrder
              ? "Here's your most recent order."
              : "You haven't ordered yet — browse cooks below!"}
        </p>
      </div>

      {lastOrder && (
        <div className="flex items-center gap-4">
          <div>
            <p className="text-sm font-semibold text-navy">{lastOrder.seller?.name || 'Seller'}</p>
            <span className={`inline-block text-xs font-semibold rounded-full px-3 py-1 mt-1 ${STATUS_STYLES[lastOrder.status] || 'bg-gray-100 text-gray-600'}`}>
              {lastOrder.status}
            </span>
          </div>
          <Link
            to={`/order/${lastOrder.id}`}
            className="text-sm font-semibold bg-coral text-white px-4 py-2.5 rounded-lg hover:bg-red-500 transition-colors shrink-0"
          >
            Track Order
          </Link>
        </div>
      )}
    </div>
  );
}

export default function PersonalizedHomeBanner() {
  if (!isLoggedIn()) return null;

  return (
    <section className="max-w-6xl mx-auto px-4 -mt-8 relative z-10 w-full">
      <Reveal>
        {isSeller() && <SellerBanner />}
        {isBuyer() && <BuyerBanner />}
      </Reveal>
    </section>
  );
}