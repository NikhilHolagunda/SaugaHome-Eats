// SellerDetailPage.jsx — View a seller's profile, menu, and place an order (US-04 + Sprint 2 ordering)
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getSellerByIdApi, getMenuApi, placeOrderApi, photoUrl } from '../api';
import { isBuyer, getToken } from '../auth';
import DietaryPill from '../components/DietaryPill';

export default function SellerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [seller, setSeller] = useState(null);
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [cart, setCart] = useState({});
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    Promise.all([getSellerByIdApi(id), getMenuApi(id)])
      .then(([sellerData, menuData]) => {
        setSeller(sellerData);
        setMenu(menuData);
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  function changeQty(itemId, delta) {
    setCart(prev => {
      const next = { ...prev };
      const current = next[itemId] || 0;
      const updated = Math.max(0, current + delta);
      if (updated === 0) delete next[itemId];
      else next[itemId] = updated;
      return next;
    });
  }

  const cartItems = menu
    .filter(item => cart[item.id])
    .map(item => ({ ...item, quantity: cart[item.id] }));
  const cartTotal = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

  async function handlePlaceOrder() {
    setOrderError('');
    if (!isBuyer()) {
      navigate('/buyer/login');
      return;
    }
    if (cartItems.length === 0) return;

    setPlacing(true);
    try {
      const order = await placeOrderApi(getToken(), {
        seller_id: seller.id,
        items: cartItems.map(i => ({ menu_item_id: i.id, quantity: i.quantity })),
        notes: notes.trim() || undefined,
      });
      setOrderSuccess(order);
      setCart({});
      setNotes('');
    } catch (err) {
      setOrderError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-text-muted">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">🍽️</div>
          <p>Loading listing…</p>
        </div>
      </div>
    );
  }

  if (notFound || !seller) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-bold text-navy mb-3">Seller not found</h1>
          <p className="text-text-muted mb-6">This listing doesn't exist or may have been removed.</p>
          <Link to="/" className="bg-coral text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-500 transition-colors inline-block">
            ← Back to home
          </Link>
        </div>
      </div>
    );
  }

  const tags = seller.dietary_tags ? seller.dietary_tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-cream pb-16">
      <div className="max-w-4xl mx-auto px-4 pt-6">
        <Link to="/" className="text-navy hover:text-coral transition-colors text-sm font-medium">
          ← Back to all sellers
        </Link>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-4">
        <div className="aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 shadow-md">
          {seller.photo_url ? (
            <img src={photoUrl(seller.photo_url)} alt={seller.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/20 to-coral/20">
              <span className="text-6xl">🍽️</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 mt-6">
        <h1 className="font-serif text-4xl font-bold text-navy mb-1">{seller.name}</h1>
        <p className="text-coral font-medium text-lg mb-4">{seller.cuisine} Cuisine</p>

        <div className="flex flex-wrap gap-2 mb-6">
          <span className="bg-cream border border-border rounded-full px-3 py-1 text-sm text-text-dark">
            📍 {seller.neighbourhood}, Mississauga
          </span>
          {tags.map(tag => <DietaryPill key={tag} tag={tag} />)}
        </div>

        <h2 className="font-serif text-2xl font-bold text-navy mb-3">About</h2>
        <p className="text-text-dark leading-relaxed mb-8">{seller.description}</p>

        <hr className="border-border mb-8" />

        <h2 className="font-serif text-2xl font-bold text-navy mb-4">Menu</h2>

        {orderSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4 mb-6">
            <p className="font-semibold mb-1">Order placed! 🎉</p>
            <p className="text-sm mb-3">
              Your order total was ${Number(orderSuccess.total_price).toFixed(2)}. {seller.name} will review it shortly.
            </p>
            <Link to="/buyer/orders" className="text-sm font-semibold text-green-800 underline hover:no-underline">
              View my orders →
            </Link>
          </div>
        )}

        {menu.length === 0 ? (
          <p className="text-text-muted mb-8">This seller hasn't added any menu items yet.</p>
        ) : (
          <div className="space-y-3 mb-8">
            {menu.map(item => {
              const qty = cart[item.id] || 0;
              return (
                <div
                  key={item.id}
                  className={`bg-card-bg rounded-xl shadow-md p-4 flex items-center justify-between gap-4 ${!item.available ? 'opacity-50' : ''}`}
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-navy">{item.name}</h3>
                    {item.description && <p className="text-text-muted text-sm mt-0.5">{item.description}</p>}
                    <p className="text-coral font-medium mt-1">${Number(item.price).toFixed(2)}</p>
                    {!item.available && <p className="text-xs text-gray-500 mt-1">Currently unavailable</p>}
                  </div>

                  {item.available && (
                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        onClick={() => changeQty(item.id, -1)}
                        disabled={qty === 0}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-cream transition disabled:opacity-40"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-medium">{qty}</span>
                      <button
                        onClick={() => changeQty(item.id, 1)}
                        className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-cream transition"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="bg-card-bg rounded-2xl shadow-lg p-6 mb-8 sticky bottom-4">
            <h3 className="font-serif text-xl font-semibold text-navy mb-3">Your Order</h3>
            <div className="space-y-1 mb-4">
              {cartItems.map(i => (
                <div key={i.id} className="flex justify-between text-sm text-text-dark">
                  <span>{i.quantity} × {i.name}</span>
                  <span>${(i.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between font-semibold text-navy border-t border-border pt-3 mb-4">
              <span>Total</span>
              <span>${cartTotal.toFixed(2)}</span>
            </div>

            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Any notes for the seller? (optional)"
              rows={2}
              className="w-full p-3 border border-border rounded-lg bg-white text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-coral/50 resize-none mb-4"
            />

            {orderError && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                {orderError}
              </div>
            )}

            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full bg-coral text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-60"
            >
              {placing ? 'Placing order…' : isBuyer() ? `Place Order — $${cartTotal.toFixed(2)}` : 'Log in as a buyer to order'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
