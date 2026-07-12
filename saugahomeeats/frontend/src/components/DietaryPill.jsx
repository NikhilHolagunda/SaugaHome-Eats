const STYLES = {
  halal: 'bg-emerald-50 text-emerald-700',
  vegetarian: 'bg-teal-50 text-teal-700',
  vegan: 'bg-lime-50 text-lime-700',
  'gluten-free': 'bg-amber-50 text-amber-700',
};

export default function DietaryPill({ tag }) {
  if (!tag) return null;
  const classes = STYLES[tag] || 'bg-gray-100 text-gray-700';
  const label = String(tag)
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join('-');

  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${classes}`}>
      {label}
    </span>
  );
}