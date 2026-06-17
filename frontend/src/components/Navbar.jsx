// Navbar.jsx — Sticky top nav
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isLoggedIn, clearToken, getToken, getSeller, saveSeller } from '../auth';
import { logoutApi, getMeApi } from '../api';

export default function Navbar() {
  const navigate = useNavigate();
  const [loggedIn, setLoggedIn] = useState(isLoggedIn());
  const [sellerId, setSellerId] = useState(null);

  useEffect(() => {
    setLoggedIn(isLoggedIn());
    if (isLoggedIn()) {
      // Load seller id for "My Listing" link
      const cached = getSeller();
      if (cached) {
        setSellerId(cached.id);
      } else {
        getMeApi(getToken())
          .then(seller => { saveSeller(seller); setSellerId(seller.id); })
          .catch(() => {});
      }
    }
  }, []);

  async function handleLogout() {
    try {
      await logoutApi(getToken());
    } catch {}
    clearToken();
    setLoggedIn(false);
    setSellerId(null);
    navigate('/');
  }

  return (
    <nav className="bg-navy text-cream sticky top-0 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="font-serif text-xl font-bold text-cream hover:text-gold transition-colors">
          🍱 SaugaHomeEats
        </Link>

        {/* Links */}
        <div className="flex items-center gap-4 text-sm font-medium">
          {loggedIn ? (
            <>
              {sellerId && (
                <Link
                  to={`/seller/${sellerId}`}
                  className="text-cream/80 hover:text-gold transition-colors"
                >
                  My Listing
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-coral text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-cream/80 hover:text-gold transition-colors">
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-coral text-white px-4 py-2 rounded-lg hover:bg-red-500 transition-colors"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
