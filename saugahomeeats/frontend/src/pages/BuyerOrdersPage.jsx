// BuyerOrdersPage.jsx — Buyer's order history and status
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getToken } from '../auth';
import { getBuyerOrdersApi, photoUrl } from '../api';

const STATUS_STYLES = {
  Placed: 'bg-amber-50 text-amber-700',
  Accepted: 'bg-emerald-50 text-emerald-700',
  Declined: 'bg-red-50 text-red-700',
};

export default function BuyerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getBuyerOrdersApi(getToken())
      .then(setOrders)
      .catch(() => setError('Could not load your orders.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-cream py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl font-bold text-navy mb-2">My Orders</h1>
        <p className="text-text-muted mb-8">Track the status of everything you've ordered.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">{error}</div>
        )}

        {loading && <p className="text-text-muted">Loading your orders…</p>}

        {!loading && orders.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🧾</div>
            <p className="text-text-muted mb-4">You haven't placed any orders yet.</p>
            <Link to="/" className="bg-coral text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-500 transition-colors inline-block">
              Browse Home Cooks
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-card-bg rounded-xl shadow-md p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-100 shrink-0">
                    {order.seller?.photo_url ? (
                      <img src={photoUrl(order.seller.photo_url)} alt={order.seller.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                    )}
                  </div>
                  <div>
                    <Link to={`/seller/${order.seller_id}`} className="font-semibold text-navy hover:text-coral transition-colors">
                      {order.seller?.name || 'Seller'}
                    </Link>
                    <p className="text-text-muted text-xs">
                      {new Date(order.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-semibold rounded-full px-3 py-1 whitespace-nowrap ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-600'}`}>
                  {order.status}
                </span>
              </div>

              <div className="border-t border-border pt-3 space-y-1">
                {order.items?.map(item => (
                  <div key={item.id} className="flex justify-between text-sm text-text-dark">
                    <span>{item.quantity} × {item.item_name}</span>
                    <span>${(item.unit_price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-semibold text-navy border-t border-border mt-2 pt-2">
                <span>Total</span>
                <span>${Number(order.total_price).toFixed(2)}</span>
              </div>
              {order.notes && (
                <p className="text-text-muted text-sm mt-2 italic">"{order.notes}"</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
