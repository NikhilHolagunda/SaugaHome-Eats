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
      className="bg-card-bg rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden cursor-pointer group border border-border"
      onClick={() => navigate(`/seller/${seller.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/seller/${seller.id}`)}
      aria-label={`View ${seller.name} listing`}
    >
      <div className="aspect-[4/3] overflow-hidden bg-cream relative">
        {seller.photo_url ? (
          <img
            src={photoUrl(seller.photo_url)}
            alt={seller.name}
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gold/20 to-coral/20">
            <span className="font-serif text-2xl text-navy/40">SaugaHomeEats</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-4">
        <h3 className="font-serif text-lg font-semibold text-navy leading-tight mb-1 group-hover:text-coral transition-colors duration-200">
          {seller.name}
        </h3>
        <p className="text-coral font-medium text-sm mb-1">{seller.cuisine}</p>
        <p className="text-text-muted text-sm mb-3">
          {seller.neighbourhood}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map(tag => <DietaryPill key={tag} tag={tag} />)}
          </div>
        )}
      </div>
    </article>
  );
}