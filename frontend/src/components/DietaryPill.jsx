// DietaryPill.jsx — Small tag for dietary labels

const PILL_COLORS = {
  halal: 'bg-green-50 text-green-700 border border-green-200',
  vegetarian: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  vegan: 'bg-lime-50 text-lime-700 border border-lime-200',
  'gluten-free': 'bg-amber-50 text-amber-700 border border-amber-200',
  default: 'bg-cream text-navy border border-border',
};

export default function DietaryPill({ tag }) {
  const colorClass = PILL_COLORS[tag.toLowerCase()] || PILL_COLORS.default;
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${colorClass}`}>
      {tag}
    </span>
  );
}
