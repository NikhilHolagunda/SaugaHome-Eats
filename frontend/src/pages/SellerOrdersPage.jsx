// SellerOrdersPage.jsx — Seller Order Dashboard (US-10)
// Logged-in seller sees incoming orders and can Accept or Decline each one.
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSellerOrdersApi, updateOrderStatusApi } from '../api';
import { getToken } from '../auth';
import Button from '../components/Button';

const STATUS_STYLES = {
  Placed:    { bg: 'bg-gold/10',   text: 'text-navy',       border: 'border-gold/40'  },
  Accepted:  { bg: 'bg-green-50',  text: 'text-green-800',  border: 'border-green-200'},
  Declined:  { bg: 'bg-red-50',    text: 'text-red-700',    border: 'border-red-200'  },
  Preparing: { bg: 'bg-blue-50',   text: 'text-blue-800',   border: 'border-blue-200' },
  'Out for Delivery': { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  Delivered: { bg: 'bg-green-100', text: 'text-green-900',  border: 'border-green-300'},
};

// US-14 — the ONLY legal next step from each status. Mirrors the backend's
// STATUS_TRANSITIONS so the button always advances exactly one stage.
const NEXT_STATUS = {
  Accepted: 'Preparing',
  Preparing: 'Out for Delivery',
  'Out for Delivery': 'Delivered',
};

function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Placed;
  return (
    <span className={`inline-block ${s.bg} ${s.text} border ${s.border} rounded-full px-3 py-1 text-xs font-semibold`}>
      {status}
    </span>
  );
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-CA', {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

function OrderCard({ order, onAccept, onDecline, onAdvance, actionInFlight }) {
  const items = order.items || [];
  const buyerName = order.buyer?.name || order.buyer?.email || 'A buyer';
  const isPending = order.status === 'Placed';
  const nextStatus = NEXT_STATUS[order.status];

  return (
    <div className="bg-white border border-border rounded-xl shadow-soft p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-serif text-xl font-bold text-navy">Order #{order.id}</h3>
          <p className="text-sm text-text-muted">
            From <span className="font-medium text-text-dark">{buyerName}</span> · {formatDate(order.created_at)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div className="border-t border-border pt-4 mb-4">
        <h4 className="text-sm font-semibold text-navy mb-2">Items</h4>
        {items.length === 0 ? (
          <p className="text-sm text-text-muted">No items on this order.</p>
        ) : (
          <ul className="space-y-1">
            {items.map(it => (
              <li key={it.id} className="flex justify-between text-sm">
                <span className="text-text-dark">
                  {it.quantity} × {it.item_name || `Item #${it.menu_item_id}`}
                </span>
                <span className="text-text-muted">
                  ${(Number(it.unit_price) * it.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {order.notes && (
        <div className="bg-cream border border-border rounded-lg p-3 mb-4">
          <p className="text-xs font-semibold text-navy mb-1">Buyer's note</p>
          <p className="text-sm text-text-dark">{order.notes}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-lg font-bold text-navy">
          Total: ${Number(order.total_price).toFixed(2)}
        </p>
        <div className="flex items-center gap-3">
          <Link
            to={`/order/${order.id}`}
            className="text-sm font-semibold text-navy hover:text-coral transition-colors"
          >
            View tracking page →
          </Link>
          {isPending && (
            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={() => onAccept(order.id)}
                disabled={actionInFlight === order.id}
              >
                {actionInFlight === order.id ? 'Working…' : 'Accept'}
              </Button>
              <button
                type="button"
                onClick={() => onDecline(order.id)}
                disabled={actionInFlight === order.id}
                className="px-6 py-3 rounded-lg border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition disabled:opacity-50"
              >
                Decline
              </button>
            </div>
          )}
          {nextStatus && (
            <Button
              variant="primary"
              onClick={() => onAdvance(order.id, nextStatus)}
              disabled={actionInFlight === order.id}
            >
              {actionInFlight === order.id ? 'Working…' : `Mark as ${nextStatus}`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SellerOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionInFlight, setActionInFlight] = useState(null);
  const [flash, setFlash] = useState('');

  const load = () => {
    setLoading(true);
    setError('');
    getSellerOrdersApi(getToken())
      .then(data => setOrders(data))
      .catch(err => setError(err.message || 'Could not load orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleStatusChange(orderId, newStatus) {
    setActionInFlight(orderId);
    setError('');
    try {
      await updateOrderStatusApi(getToken(), orderId, newStatus);
      setFlash(`Order #${orderId} ${newStatus.toLowerCase()}.`);
      setTimeout(() => setFlash(''), 3000);
      load();
    } catch (err) {
      setError(err.message || `Could not ${newStatus.toLowerCase()} the order.`);
    } finally {
      setActionInFlight(null);
    }
  }

  const pending = orders.filter(o => o.status === 'Placed');
  const active = orders.filter(o => ['Accepted', 'Preparing', 'Out for Delivery'].includes(o.status));
  const historical = orders.filter(o => ['Delivered', 'Declined'].includes(o.status));

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 w-full">
      <div className="mb-8">
        <h1 className="font-serif text-4xl font-bold text-navy mb-2">Order Dashboard</h1>
        <p className="text-text-muted">
          Accept incoming orders, then move them through preparing and delivery. Buyers see every update immediately.
        </p>
      </div>

      {flash && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-3 mb-6">
          {flash}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="bg-white border border-border rounded-xl shadow-soft p-6">
              <div className="skeleton h-6 w-1/3 mb-3" />
              <div className="skeleton h-4 w-1/2 mb-6" />
              <div className="skeleton h-4 w-full mb-2" />
              <div className="skeleton h-4 w-2/3" />
            </div>
          ))}
        </div>
      )}

      {!loading && orders.length === 0 && !error && (
        <div className="text-center py-16 bg-white border border-border rounded-xl">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="font-serif text-2xl text-navy mb-2">No orders yet</h3>
          <p className="text-text-muted">
            When a buyer places an order from your listing, it will show up here.
          </p>
        </div>
      )}

      {!loading && pending.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-navy mb-4">
            Pending ({pending.length})
          </h2>
          <div className="space-y-4">
            {pending.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={id => handleStatusChange(id, 'Accepted')}
                onDecline={id => handleStatusChange(id, 'Declined')}
                onAdvance={handleStatusChange}
                actionInFlight={actionInFlight}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && active.length > 0 && (
        <section className="mb-10">
          <h2 className="font-serif text-2xl font-bold text-navy mb-4">
            In Progress ({active.length})
          </h2>
          <div className="space-y-4">
            {active.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={() => {}}
                onDecline={() => {}}
                onAdvance={handleStatusChange}
                actionInFlight={actionInFlight}
              />
            ))}
          </div>
        </section>
      )}

      {!loading && historical.length > 0 && (
        <section>
          <h2 className="font-serif text-2xl font-bold text-navy mb-4">
            Order History ({historical.length})
          </h2>
          <div className="space-y-4">
            {historical.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                onAccept={() => {}}
                onDecline={() => {}}
                onAdvance={() => {}}
                actionInFlight={actionInFlight}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}