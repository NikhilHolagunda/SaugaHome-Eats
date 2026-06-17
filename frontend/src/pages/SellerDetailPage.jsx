// SellerDetailPage.jsx — Full seller profile (US-04)
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DietaryPill from '../components/DietaryPill';
import { getSellerByIdApi, photoUrl } from '../api';

export default function SellerDetailPage() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getSellerByIdApi(id)
      .then(data => setSeller(data))
      .catch(err => {
        if (err.message?.includes('404') || err.message?.includes('not found')) {
          setNotFound(true);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center text-text-muted">
          <div className="text-4xl mb-4 animate-pulse">🍽️</div>
          <p>Loading seller…</p>
        </div>
      </div>
    );
  }

  if (notFound || !seller) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-6">🙁</div>
          <h1 className="font-serif text-3xl text-navy mb-3">Seller not found</h1>
          <p className="text-text-muted mb-6">This listing may have been removed or doesn't exist.</p>
          <Link to="/" className="bg-coral text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-500 transition-colors inline-block">
            ← Back to all sellers
          </Link>
        </div>
      </div>
    );
  }

  const tags = seller.dietary_tags
    ? seller.dietary_tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link to="/" className="inline-flex items-center gap-1 text-text-muted hover:text-navy transition-colors text-sm mb-6">
          ← Back to all sellers
        </Link>

        <div className="bg-card-bg rounded-2xl shadow-lg overflow-hidden">
          {/* Hero Photo */}
          <div className="aspect-[16/7] bg-gradient-to-br from-gold/20 to-coral/20 overflow-hidden">
            {seller.photo_url ? (
              <img
                src={photoUrl(seller.photo_url)}
                alt={`${seller.name} food photo`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-8xl">🍽️</span>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-6 md:p-10">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="font-serif text-3xl md:text-4xl font-bold text-navy mb-2">
                  {seller.name}
                </h1>
                <p className="text-coral text-xl font-medium">{seller.cuisine} Cuisine</p>
              </div>
            </div>

            {/* Tags row */}
            <div className="flex flex-wrap items-center gap-2 mb-8">
              <span className="inline-flex items-center gap-1 text-sm text-text-muted bg-gray-50 rounded-full px-3 py-1 border border-border">
                📍 {seller.neighbourhood}, Mississauga
              </span>
              {tags.map(tag => <DietaryPill key={tag} tag={tag} />)}
            </div>

            {/* Description */}
            <div className="mb-10">
              <h2 className="font-serif text-xl font-semibold text-navy mb-3">About</h2>
              <p className="text-text-dark leading-relaxed text-lg">{seller.description}</p>
            </div>

            {/* CTA */}
            <div className="border-t border-border pt-8">
              <h2 className="font-serif text-xl font-semibold text-navy mb-2">Interested?</h2>
              <p className="text-text-muted mb-4">Online ordering is coming in Sprint 2. For now, reach out directly!</p>
              <button
                onClick={() => alert('Contact / ordering feature coming in Sprint 2! 🚀')}
                className="bg-coral text-white font-semibold py-3 px-8 rounded-lg hover:bg-red-500 transition-colors text-lg"
              >
                📞 Contact Seller
              </button>
            </div>
          </div>
        </div>

        {/* Member since */}
        {seller.created_at && (
          <p className="text-center text-text-muted text-sm mt-6">
            Member since {new Date(seller.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long' })}
          </p>
        )}
      </div>
    </div>
  );
}
