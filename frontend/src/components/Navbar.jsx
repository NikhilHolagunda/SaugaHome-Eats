// Navbar.jsx — Sticky top nav (seller and buyer aware) with mobile drawer
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isLoggedIn, isSeller, isBuyer, clearToken, getToken, getSeller, getBuyer, saveSeller } from '../auth';
import { logoutApi, getMeApi } from '../api';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [seller, setSeller] = useState(getSeller());
  const [buyer, setBuyer] = useState(getBuyer());
  const [menuOpen, setMenuOpen] = useState(false);

  // Re-sync from localStorage only when the route changes — NOT on every render.
  // A missing dependency array here previously caused an infinite render loop.
  useEffect(() => {
    setLoggedIn(isLoggedIn());
    setSeller(getSeller());
    setBuyer(getBuyer());
    setMenuOpen(false);
  }, [location.pathname]);

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
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <nav className="sticky top-0 z-50 bg-navy text-cream shadow-md">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight">
          SaugaHomeEats
        </Link>

        <div className="hidden md:flex items-center gap-4 text-sm md:text-base">
          <Link to="/" className="hover:text-coral transition">Browse</Link>

          {!loggedIn && (
            <>
              <Link to="/login" className="hover:text-coral transition">Seller Login</Link>
              <Link to="/signup" className="hover:text-coral transition">List Your Food</Link>
              <Link to="/buyer/login" className="hover:text-coral transition">Buyer Login</Link>
              <Link to="/buyer/signup" className="bg-coral text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition">
                Sign up
              </Link>
            </>
          )}

          {loggedIn && isSeller() && (
            <>
              {seller?.id && <Link to={`/seller/${seller.id}`} className="hover:text-coral transition">My Listing</Link>}
              <Link to="/seller/menu" className="hover:text-coral transition">My Menu</Link>
              <Link to="/seller/dashboard" className="hover:text-coral transition">Orders</Link>
              <button onClick={handleLogout} className="bg-coral text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition">
                Logout
              </button>
            </>
          )}

          {loggedIn && isBuyer() && (
            <>
              <Link to="/buyer/orders" className="hover:text-coral transition">My Orders</Link>
              <button onClick={handleLogout} className="bg-coral text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition">
                Logout
              </button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 -mr-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-navy border-t border-white/10 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1 text-base">
            <Link to="/" className="py-2.5 hover:text-coral transition-colors">Browse</Link>

            {!loggedIn && (
              <>
                <Link to="/login" className="py-2.5 hover:text-coral transition-colors">Seller Login</Link>
                <Link to="/signup" className="py-2.5 hover:text-coral transition-colors">List Your Food</Link>
                <Link to="/buyer/login" className="py-2.5 hover:text-coral transition-colors">Buyer Login</Link>
                <Link to="/buyer/signup" className="mt-2 bg-coral text-white px-4 py-2 rounded-lg text-center">Sign up</Link>
              </>
            )}

            {loggedIn && isSeller() && (
              <>
                {seller?.id && <Link to={`/seller/${seller.id}`} className="py-2.5 hover:text-coral transition-colors">My Listing</Link>}
                <Link to="/seller/menu" className="py-2.5 hover:text-coral transition-colors">My Menu</Link>
                <Link to="/seller/dashboard" className="py-2.5 hover:text-coral transition-colors">Orders</Link>
                <button onClick={handleLogout} className="mt-2 bg-coral text-white px-4 py-2 rounded-lg text-center">Logout</button>
              </>
            )}

            {loggedIn && isBuyer() && (
              <>
                <Link to="/buyer/orders" className="py-2.5 hover:text-coral transition-colors">My Orders</Link>
                <button onClick={handleLogout} className="mt-2 bg-coral text-white px-4 py-2 rounded-lg text-center">Logout</button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
