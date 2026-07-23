// Navbar.jsx — Sticky top nav (seller and buyer aware) with mobile drawer.
// Signature touches: a coral→gold gradient underline (the brand's signature
// hairline, visible on every page), links that grow an underline from center
// on hover instead of just swapping color, and the shared <Button /> for
// every CTA so the shine-sweep hover matches the rest of the app.
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isLoggedIn, isSeller, isBuyer, clearToken, getToken, getSeller, getBuyer, saveSeller } from '../auth';
import { logoutApi, getMeApi } from '../api';
import Button from './Button';

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
    <nav className="sticky top-0 z-50 bg-navy text-cream shadow-[0_4px_24px_-8px_rgba(30,39,97,0.45)]">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl font-bold tracking-tight transition-colors hover:text-coral">
          SaugaHomeEats
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm md:text-base">
          <Link to="/" className="nav-link pb-1">Browse</Link>

          {!loggedIn && (
            <>
              <Link to="/login" className="nav-link pb-1">Seller Login</Link>
              <Link to="/signup" className="nav-link pb-1">List Your Food</Link>
              <Link to="/buyer/login" className="nav-link pb-1">Buyer Login</Link>
              <Button variant="primary" to="/buyer/signup" className="!px-4 !py-2 text-sm">
                Sign up
              </Button>
            </>
          )}

          {loggedIn && isSeller() && (
            <>
              {seller?.id && <Link to={`/seller/${seller.id}`} className="nav-link pb-1">My Listing</Link>}
              <Link to="/seller/edit-profile" className="nav-link pb-1">Edit Listing</Link>
              <Link to="/seller/menu" className="nav-link pb-1">My Menu</Link>
              <Link to="/seller/dashboard" className="nav-link pb-1">Orders</Link>
              <Button variant="primary" onClick={handleLogout} className="!px-4 !py-2 text-sm">
                Logout
              </Button>
            </>
          )}

          {loggedIn && isBuyer() && (
            <>
              <Link to="/buyer/orders" className="nav-link pb-1">My Orders</Link>
              <Button variant="primary" onClick={handleLogout} className="!px-4 !py-2 text-sm">
                Logout
              </Button>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2 -mr-2 rounded-lg hover:bg-white/10 transition-colors"
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <svg
            className={`w-6 h-6 transition-transform duration-300 ${menuOpen ? 'rotate-90' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Signature gradient hairline — the brand's underline, carried on every page */}
      <div className="h-[3px] bg-gradient-to-r from-coral via-gold to-coral" />

      {menuOpen && (
        <div className="md:hidden bg-navy border-t border-white/10 overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-1 text-base">
            <Link to="/" className="py-2.5 hover:text-coral transition-colors">Browse</Link>

            {!loggedIn && (
              <>
                <Link to="/login" className="py-2.5 hover:text-coral transition-colors">Seller Login</Link>
                <Link to="/signup" className="py-2.5 hover:text-coral transition-colors">List Your Food</Link>
                <Link to="/buyer/login" className="py-2.5 hover:text-coral transition-colors">Buyer Login</Link>
                <Button variant="primary" to="/buyer/signup" className="mt-2 w-full">Sign up</Button>
              </>
            )}

            {loggedIn && isSeller() && (
              <>
                {seller?.id && <Link to={`/seller/${seller.id}`} className="py-2.5 hover:text-coral transition-colors">My Listing</Link>}
                <Link to="/seller/edit-profile" className="py-2.5 hover:text-coral transition-colors">Edit Listing</Link>
                <Link to="/seller/menu" className="py-2.5 hover:text-coral transition-colors">My Menu</Link>
                <Link to="/seller/dashboard" className="py-2.5 hover:text-coral transition-colors">Orders</Link>
                <Button variant="primary" onClick={handleLogout} className="mt-2 w-full">Logout</Button>
              </>
            )}

            {loggedIn && isBuyer() && (
              <>
                <Link to="/buyer/orders" className="py-2.5 hover:text-coral transition-colors">My Orders</Link>
                <Button variant="primary" onClick={handleLogout} className="mt-2 w-full">Logout</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}