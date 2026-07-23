// HeroFoodIllustration.jsx — decorative animated illustration for the home
// page hero: a bowl with steam wisps rising, and a few food icons drifting
// upward on loop. Pure SVG + CSS animation (see .steam-wisp / .food-float in
// index.css) — no video/image assets, so nothing to load or buffer.
// Purely decorative: aria-hidden, pointer-events-none, hidden on small screens
// to keep the hero text uncluttered on mobile.
export default function HeroFoodIllustration() {
  return (
    <div
      aria-hidden="true"
      className="hidden md:block absolute right-6 lg:right-16 top-1/2 -translate-y-1/2 pointer-events-none select-none"
    >
      <div className="relative w-40 h-40">
        {/* Bowl */}
        <svg viewBox="0 0 120 80" className="absolute bottom-0 w-40 h-auto">
          <path
            d="M10 30 C10 30 15 65 60 65 C105 65 110 30 110 30 Z"
            fill="rgba(244, 162, 97, 0.35)"
            stroke="rgba(244, 162, 97, 0.6)"
            strokeWidth="2"
          />
          <ellipse cx="60" cy="30" rx="50" ry="9" fill="rgba(249, 97, 103, 0.25)" stroke="rgba(249, 97, 103, 0.5)" strokeWidth="2" />
        </svg>

        {/* Steam wisps */}
        <svg viewBox="0 0 120 60" className="absolute bottom-14 w-40 h-auto overflow-visible">
          <path className="steam-wisp" style={{ animationDelay: '0s' }} d="M45 60 C40 45 55 40 50 25" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0" />
          <path className="steam-wisp" style={{ animationDelay: '1.1s' }} d="M60 60 C55 42 70 38 65 20" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0" />
          <path className="steam-wisp" style={{ animationDelay: '2.2s' }} d="M75 60 C70 45 85 40 80 25" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0" />
        </svg>

        {/* Drifting food icons */}
        <span className="food-float absolute left-[-2.5rem] top-6 text-3xl" style={{ animationDelay: '0s' }}>🥟</span>
        <span className="food-float absolute right-[-2rem] top-2 text-3xl" style={{ animationDelay: '2.1s' }}>🫓</span>
        <span className="food-float absolute left-2 top-[-1rem] text-2xl" style={{ animationDelay: '4.2s' }}>🌶️</span>
      </div>
    </div>
  );
}