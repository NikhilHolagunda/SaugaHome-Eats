// Navbar.jsx — Sticky top nav (seller and buyer aware)
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isLoggedIn, isSeller, isBuyer, clearToken, getToken, getSeller, getBuyer, saveSeller } from '../auth';
import { logoutApi, getMeApi } from '../api';

export default function Navbar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [seller, setSeller] = useState(getSeller());
  const [buyer, setBuyer] = useState(getBuyer());

  useEffect(() => {
    // Refresh when navigating in case another page saved fresh info
    setLoggedIn(isLoggedIn());
    setSeller(getSeller());
    setBuyer(getBuyer());
  });

  // If seller is logged in but we don't yet know their id (edge case), fetch it
  useEffect(() => {
    const token = getToken();
    if (token && isSeller() && !getSeller()?.id) {
      getMeApi(token).then(me => {
        saveSeller(me);
        setSeller(me);
      }).catch(() => {});
    }
  }, [loggedIn]);

  async function handleLogout() {
    const token = getToken();
    try { if (token) await logoutApi(token); } catch { /* ignore */ }
    clearToken();
    setLoggedIn(false);
    setSeller(null);
    setBuyer(null);
    navigate('/');
  }

  return (
    <nav className="sticky top-0 z-50 bg-navy text-cream shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight">
          SaugaHomeEats
        </Link>

        <div className="flex items-center gap-4 text-sm md:text-base">
          <Link to="/" className="hover:text-coral transition">Browse</Link>

          {!loggedIn && (
            <>
              <Link to="/login" className="hover:text-coral transition">Seller Login</Link>
              <Link to="/signup" className="hover:text-coral transition">List Your Food</Link>
              <Link to="/buyer/login" className="hover:text-coral transition">Buyer Login</Link>
              <Link
                to="/buyer/signup"
                className="bg-coral text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
              >
                Sign up
              </Link>
            </>
          )}

          {loggedIn && isSeller() && (
            <>
              {seller?.id && (
                <Link to={`/seller/${seller.id}`} className="hover:text-coral transition">My Listing</Link>
              )}
              <Link to="/seller/menu" className="hover:text-coral transition">My Menu</Link>
              <Link to="/seller/dashboard" className="hover:text-coral transition">Orders</Link>
              <button
                onClick={handleLogout}
                className="bg-coral text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
              >
                Logout
              </button>
            </>
          )}

          {loggedIn && isBuyer() && (
            <>
              <Link to="/buyer/orders" className="hover:text-coral transition">My Orders</Link>
              <button
                onClick={handleLogout}
                className="bg-coral text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}