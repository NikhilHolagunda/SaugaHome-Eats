import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SellerCard from '../components/SellerCard';
import { getSellersApi } from '../api';

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-2">
        <div className="h-5 w-3/4 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const gridRef = useRef(null);

  useEffect(() => {
    getSellersApi()
      .then(data => setSellers(data))
      .catch(() => setError('Could not load sellers. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  function scrollToGrid() {
    gridRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-navy via-navy/95 to-navy/80 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-coral/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="inline-block bg-coral/20 text-coral border border-coral/30 rounded-full px-4 py-1 text-sm font-medium mb-6">
            Mississauga's Home Cook Directory
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Authentic home-cooked food, made by your neighbours
          </h1>
          <p className="text-white/70 text-lg md:text-xl mb-10">
            Discover Mississauga's hidden home cooks — tiffin services, bakers, and caterers right in your neighbourhood.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={scrollToGrid}
              className="bg-coral text-white font-semibold px-8 py-3 rounded-lg hover:bg-red-500 transition-colors text-lg"
            >
              Browse Cooks
            </button>
            <Link
              to="/signup"
              className="bg-white text-navy font-semibold px-8 py-3 rounded-lg hover:bg-cream transition-colors text-lg border border-white/20 text-center"
            >
              List Your Food
            </Link>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      {sellers.length > 0 && (
        <div className="bg-gold/10 border-y border-gold/20 py-4 px-4">
          <p className="text-center text-navy font-medium">
            {sellers.length} home cooks listed in Mississauga
          </p>
        </div>
      )}

      {/* Grid */}
      <section ref={gridRef} className="max-w-6xl mx-auto px-4 py-12 flex-1 w-full">
        <h2 className="font-serif text-3xl font-bold text-navy mb-8">Our Home Cooks</h2>

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
            {error}
          </div>
        )}

        {!loading && !error && sellers.length === 0 && (
          <div className="text-center py-20">
            <h3 className="font-serif text-2xl text-navy mb-3">No sellers yet — be the first to list!</h3>
            <p className="text-gray-500 mb-6">Share your home cooking with your Mississauga neighbours.</p>
            <Link
              to="/signup"
              className="bg-coral text-white font-semibold px-8 py-3 rounded-lg hover:bg-red-500 transition-colors inline-block"
            >
              Create Your Listing
            </Link>
          </div>
        )}

        {!loading && !error && sellers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller, i) => (
              <div
                key={seller.id}
                style={{
                  opacity: 0,
                  animation: `fadeInUp 0.5s ease-out ${Math.min(i * 60, 400)}ms forwards`,
                }}
              >
                <SellerCard seller={seller} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}