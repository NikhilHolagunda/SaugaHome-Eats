// SellerCard.jsx — Card shown in the home page grid
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
      className="bg-card-bg rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer overflow-hidden group h-full flex flex-col"
      onClick={() => navigate(`/seller/${seller.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/seller/${seller.id}`)}
      aria-label={`View ${seller.name}'s listing`}
    >
      {/* Photo */}
      <div className="aspect-[4/3] overflow-hidden bg-gray-100">
        {seller.photo_url ? (
          <img
            src={photoUrl(seller.photo_url)}
            alt={`${seller.name} food photo`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/20 to-coral/20">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-serif text-lg font-semibold text-navy leading-tight mb-1">
          {seller.name}
        </h3>
        <p className="text-coral font-medium text-sm mb-1">{seller.cuisine}</p>
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
