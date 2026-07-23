// HomePage.jsx — Browse all sellers with search + filters (US-03, US-05, US-06, US-07, US-08)
import { useState, useEffect, useRef, useCallback } from 'react';
import SellerCard from '../components/SellerCard';
import Button from '../components/Button';
import HeroFoodIllustration from '../components/HeroFoodIllustration';
import PersonalizedHomeBanner from '../components/PersonalizedHomeBanner';
import { getSellersApi, getFiltersApi } from '../api';

const DIETARY_OPTIONS = ['halal', 'vegetarian', 'vegan', 'gluten-free'];

function SkeletonCard() {
  return (
    <div className="bg-card-bg rounded-xl shadow-soft overflow-hidden">
      <div className="aspect-[4/3] skeleton" />
      <div className="p-4 space-y-2">
        <div className="skeleton h-5 w-3/4" />
        <div className="skeleton h-4 w-1/2" />
        <div className="skeleton h-4 w-2/3" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const gridRef = useRef(null);

  // Filter state
  const [search, setSearch] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [neighbourhood, setNeighbourhood] = useState('');
  const [dietary, setDietary] = useState('');

  // Dropdown options fetched from backend
  const [filterOptions, setFilterOptions] = useState({ cuisines: [], neighbourhoods: [] });

  // Load the filter dropdown options once on mount
  useEffect(() => {
    getFiltersApi()
      .then(data => setFilterOptions({
        cuisines: data.cuisines || [],
        neighbourhoods: data.neighbourhoods || [],
      }))
      .catch(() => { /* non-fatal — filters just stay empty */ });
  }, []);

  // Fetch sellers whenever any filter changes. Search is debounced 300ms so we
  // don't hit the backend on every keystroke; the other filters fire immediately.
  const fetchSellers = useCallback((params) => {
    setLoading(true);
    setError('');
    getSellersApi(params)
      .then(data => setSellers(data))
      .catch(() => setError('Could not load sellers. Is the backend running?'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (cuisine) params.cuisine = cuisine;
    if (neighbourhood) params.neighbourhood = neighbourhood;
    if (dietary) params.dietary = dietary;

    const t = setTimeout(() => fetchSellers(params), 300);
    return () => clearTimeout(t);
  }, [search, cuisine, neighbourhood, dietary, fetchSellers]);

  function scrollToGrid() {
    gridRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function clearFilters() {
    setSearch('');
    setCuisine('');
    setNeighbourhood('');
    setDietary('');
  }

  const hasActiveFilters = search || cuisine || neighbourhood || dietary;

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-navy via-navy/95 to-navy/80 text-white py-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-coral/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gold/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <HeroFoodIllustration />

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <span className="inline-block bg-coral/20 text-coral border border-coral/30 rounded-full px-4 py-1 text-sm font-medium mb-6">
            🏠 Mississauga's Home Cook Directory
          </span>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Authentic home-cooked food, made by your neighbours
          </h1>
          <p className="text-white/70 text-lg md:text-xl mb-10">
            Discover Mississauga's hidden home cooks — tiffin services, bakers, and caterers right in your neighbourhood.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="primary" onClick={scrollToGrid} className="text-lg">
              Browse Cooks
            </Button>
            <Button variant="secondary" to="/signup" className="text-lg bg-white">
              List Your Food
            </Button>
          </div>
        </div>
      </section>

      <PersonalizedHomeBanner />

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      {!loading && !error && (
        <div className="bg-gold/10 border-y border-gold/20 py-4 px-4">
          <p className="text-center text-navy font-medium">
            🍽️ {sellers.length} home cook{sellers.length !== 1 ? 's' : ''}
            {hasActiveFilters ? ' match your filters' : ' listed in Mississauga'}
          </p>
        </div>
      )}

      {/* ── Search + Filters (US-05, US-06, US-07, US-08) ───────────────── */}
      <section ref={gridRef} className="max-w-6xl mx-auto px-4 pt-10 pb-4 w-full">
        <h2 className="font-serif text-3xl font-bold text-navy mb-6">Our Home Cooks</h2>

        <div className="bg-white border border-border rounded-xl shadow-soft p-4 md:p-6 mb-8">
          {/* Search input — full width */}
          <div className="mb-4">
            <label htmlFor="search" className="block text-sm font-semibold text-navy mb-2">
              Search
            </label>
            <input
              id="search"
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by cook name, cuisine, or description…"
              className="w-full p-3 border border-border rounded-lg bg-white text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-coral/50"
            />
          </div>

          {/* Three filter dropdowns in a responsive row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="cuisine" className="block text-sm font-semibold text-navy mb-2">
                Cuisine
              </label>
              <select
                id="cuisine"
                value={cuisine}
                onChange={e => setCuisine(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-coral/50"
              >
                <option value="">All cuisines</option>
                {filterOptions.cuisines.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="neighbourhood" className="block text-sm font-semibold text-navy mb-2">
                Neighbourhood
              </label>
              <select
                id="neighbourhood"
                value={neighbourhood}
                onChange={e => setNeighbourhood(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-coral/50"
              >
                <option value="">All neighbourhoods</option>
                {filterOptions.neighbourhoods.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dietary" className="block text-sm font-semibold text-navy mb-2">
                Dietary
              </label>
              <select
                id="dietary"
                value={dietary}
                onChange={e => setDietary(e.target.value)}
                className="w-full p-3 border border-border rounded-lg bg-white text-text-dark focus:outline-none focus:ring-2 focus:ring-coral/50"
              >
                <option value="">Any dietary</option>
                {DIETARY_OPTIONS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-text-muted">
                Filters active — {[
                  search && `search: "${search}"`,
                  cuisine && `cuisine: ${cuisine}`,
                  neighbourhood && `area: ${neighbourhood}`,
                  dietary && `dietary: ${dietary}`,
                ].filter(Boolean).join(' · ')}
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-semibold text-coral hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Grid ────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-12 flex-1 w-full">
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
            <div className="text-6xl mb-6">🔍</div>
            <h3 className="font-serif text-2xl text-navy mb-3">
              {hasActiveFilters ? 'No cooks match your filters' : 'No sellers yet — be the first to list!'}
            </h3>
            <p className="text-text-muted mb-6">
              {hasActiveFilters
                ? 'Try clearing a filter or searching for something else.'
                : 'Share your home cooking with your Mississauga neighbours.'}
            </p>
            {hasActiveFilters ? (
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : (
              <Button variant="primary" to="/signup">
                Create Your Listing
              </Button>
            )}
          </div>
        )}

        {!loading && !error && sellers.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller, i) => (
              <div key={seller.id} className="stagger-item h-full" style={{ animationDelay: `${Math.min(i * 60, 400)}ms` }}>
                <SellerCard seller={seller} />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}