import { useNavigate } from 'react-router-dom';

export default function BackButton({ to = -1, label = 'Back' }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => (typeof to === 'number' ? navigate(to) : navigate(to))}
      className="inline-flex items-center gap-2 text-navy hover:text-coral font-medium mb-6 transition"
    >
      <span className="text-lg leading-none">&larr;</span>
      {label}
    </button>
  );
}