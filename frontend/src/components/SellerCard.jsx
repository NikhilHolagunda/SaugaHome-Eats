// SellerCard.jsx — Card shown in the home page grid.
// Signature interaction: hovering the photo slowly zooms it, a warm navy
// gradient rises from the bottom, and a "View Menu" prompt slides into view —
// like turning over a menu card at the table.
import { useNavigate } from 'react-router-dom';
import DietaryPill from './DietaryPill';
import { photoUrl } from '../api';

export default function SellerCard({ seller }) {
  const navigate = useNavigate();
  const tags = seller.dietary_tags
    ? seller.dietary_tags.split(',').map(t => t.trim()).filter(Boolean)
    : [];

  return (
    <article
      className="card-glow bg-card-bg rounded-xl overflow-hidden cursor-pointer group h-full flex flex-col"
      onClick={() => navigate(`/seller/${seller.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/seller/${seller.id}`)}
      aria-label={`View ${seller.name}'s listing`}
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {seller.photo_url ? (
          <img
            src={photoUrl(seller.photo_url)}
            alt={`${seller.name} food photo`}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/20 to-coral/20">
            <span className="text-4xl">🍽️</span>
          </div>
        )}

        {/* Cuisine badge, always visible on the photo */}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-navy text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
          {seller.cuisine}
        </span>

        {/* Gradient overlay, fades in on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* "View Menu" prompt, slides up on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <span className="inline-flex items-center gap-1.5 text-white font-semibold text-sm">
            View Menu
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-serif text-lg font-semibold text-navy leading-tight mb-1 transition-colors group-hover:text-coral">
          {seller.name}
        </h3>
        <p className="text-text-muted text-sm mb-3 flex items-center gap-1">
          <span>📍</span> {seller.neighbourhood}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto">
            {tags.map(tag => <DietaryPill key={tag} tag={tag} />)}
          </div>
        )}
      </div>
    </article>
  );
}