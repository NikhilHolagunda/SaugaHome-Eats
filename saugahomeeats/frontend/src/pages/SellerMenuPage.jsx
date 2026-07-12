// SellerMenuPage.jsx — Seller adds/edits/deletes their menu items
import { useState, useEffect } from 'react';
import { getToken, getSeller } from '../auth';
import { getMenuApi, addMenuItemApi, updateMenuItemApi, deleteMenuItemApi } from '../api';

export default function SellerMenuPage() {
  const seller = getSeller();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [form, setForm] = useState({ name: '', description: '', price: '' });
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!seller?.id) return;
    getMenuApi(seller.id)
      .then(setItems)
      .catch(() => setError('Could not load your menu.'))
      .finally(() => setLoading(false));
  }, [seller?.id]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  }

  async function handleAdd(e) {
    e.preventDefault();
    setFormError('');
    if (!form.name.trim()) return setFormError('Item name is required');
    if (form.price === '' || isNaN(form.price) || Number(form.price) < 0) {
      return setFormError('Enter a valid non-negative price');
    }

    setSaving(true);
    try {
      const created = await addMenuItemApi(getToken(), {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
      });
      setItems(prev => [...prev, created]);
      setForm({ name: '', description: '', price: '' });
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function toggleAvailable(item) {
    try {
      const updated = await updateMenuItemApi(getToken(), item.id, { available: item.available ? 0 : 1 });
      setItems(prev => prev.map(i => (i.id === item.id ? updated : i)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Remove "${item.name}" from your menu?`)) return;
    try {
      await deleteMenuItemApi(getToken(), item.id);
      setItems(prev => prev.filter(i => i.id !== item.id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="min-h-screen bg-cream py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-serif text-4xl font-bold text-navy mb-2">My Menu</h1>
        <p className="text-text-muted mb-8">Add dishes so buyers can order from you.</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <div className="bg-card-bg rounded-2xl shadow-lg p-6 mb-8">
          <h2 className="font-serif text-xl font-semibold text-navy mb-4">Add a dish</h2>
          {formError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
              {formError}
            </div>
          )}
          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Dish name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Butter Chicken Tiffin"
                className="w-full p-3 border border-border rounded-lg bg-white text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-coral/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">
                Description <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={2}
                placeholder="Served with rice and a side of raita"
                className="w-full p-3 border border-border rounded-lg bg-white text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-coral/50 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1">Price (CAD)</label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="12.99"
                className="w-full p-3 border border-border rounded-lg bg-white text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-coral/50"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-coral text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-60"
            >
              {saving ? 'Adding…' : '+ Add to Menu'}
            </button>
          </form>
        </div>

        <h2 className="font-serif text-xl font-semibold text-navy mb-4">Your dishes</h2>
        {loading && <p className="text-text-muted">Loading your menu…</p>}
        {!loading && items.length === 0 && (
          <p className="text-text-muted">You haven't added any dishes yet. Add your first one above.</p>
        )}
        <div className="space-y-3">
          {items.map(item => (
            <div key={item.id} className="bg-card-bg rounded-xl shadow-md p-4 flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-navy">{item.name}</h3>
                  {!item.available && (
                    <span className="text-xs bg-gray-100 text-gray-500 rounded-full px-2 py-0.5">Unavailable</span>
                  )}
                </div>
                {item.description && <p className="text-text-muted text-sm mt-0.5">{item.description}</p>}
                <p className="text-coral font-medium mt-1">${Number(item.price).toFixed(2)}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => toggleAvailable(item)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-cream transition"
                >
                  {item.available ? 'Mark Unavailable' : 'Mark Available'}
                </button>
                <button
                  onClick={() => handleDelete(item)}
                  className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
