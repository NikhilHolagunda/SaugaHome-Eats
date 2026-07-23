// CreateListingPage.jsx — Seller profile creation (US-02) and, in edit mode, US-17.
// POST /api/sellers is an UPSERT keyed on the logged-in seller's own row, so the
// exact same form + submit call works for both "create my first listing" and
// "edit my existing listing" — only the pre-fill and labels differ.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken, isLoggedIn } from '../auth';
import { createListingApi, getMeApi, photoUrl } from '../api';

const NEIGHBOURHOODS = [
  'Square One', 'Streetsville', 'Port Credit', 'Erin Mills',
  'Meadowvale', 'Cooksville', 'Mississauga Valley', 'Clarkson',
  'Lakeview', 'Malton', 'Dixie', 'Hurontario',
];

const DIETARY_OPTIONS = [
  { value: 'halal', label: '🟢 Halal' },
  { value: 'vegetarian', label: '🥦 Vegetarian' },
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'gluten-free', label: '🌾 Gluten-Free' },
];

export default function CreateListingPage({ isEditing = false }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', cuisine: '', neighbourhood: '', description: '', dietary_tags: [],
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [existingPhotoUrl, setExistingPhotoUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(isEditing);

  // Require login
  useEffect(() => {
    if (!isLoggedIn()) navigate('/login');
  }, [navigate]);

  // Edit mode: load the seller's current data to pre-fill the form.
  useEffect(() => {
    if (!isEditing) return;
    getMeApi(getToken())
      .then(me => {
        setForm({
          name: me.name || '',
          cuisine: me.cuisine || '',
          neighbourhood: me.neighbourhood || '',
          description: me.description || '',
          dietary_tags: me.dietary_tags ? me.dietary_tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        });
        setExistingPhotoUrl(me.photo_url || null);
      })
      .catch(err => setServerError(err.message || 'Could not load your current listing.'))
      .finally(() => setLoadingExisting(false));
  }, [isEditing]);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  }

  function handleDietaryChange(value) {
    setForm(prev => ({
      ...prev,
      dietary_tags: prev.dietary_tags.includes(value)
        ? prev.dietary_tags.filter(t => t !== value)
        : [...prev.dietary_tags, value],
    }));
  }

  function handlePhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
    setErrors(prev => ({ ...prev, photo: '' }));
  }

  function validate() {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Cook name is required';
    if (!form.cuisine.trim()) errs.cuisine = 'Cuisine type is required';
    if (!form.neighbourhood) errs.neighbourhood = 'Neighbourhood is required';
    if (!form.description.trim()) errs.description = 'Description is required';
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name.trim());
      formData.append('cuisine', form.cuisine.trim());
      formData.append('neighbourhood', form.neighbourhood);
      formData.append('description', form.description.trim());
      formData.append('dietary_tags', form.dietary_tags.join(','));
      if (photo) formData.append('photo', photo); // omitted on edit if unchanged — backend keeps the existing photo

      const seller = await createListingApi(getToken(), formData);
      navigate(`/seller/${seller.id}`);
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loadingExisting) {
    return (
      <div className="min-h-screen bg-cream py-10 px-4 flex items-center justify-center">
        <p className="text-text-muted">Loading your listing…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-serif text-4xl font-bold text-navy mb-2">
            {isEditing ? 'Edit Your Listing' : 'Create Your Listing'}
          </h1>
          <p className="text-text-muted">
            {isEditing
              ? 'Keep your profile up to date so buyers see the real you'
              : 'Tell your neighbours what you cook and where to find you'}
          </p>
        </div>

        <div className="bg-card-bg rounded-2xl shadow-lg p-8">
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Cook Name */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="name">
                Cook / Business Name <span className="text-coral">*</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Priya's Kitchen, Maria's Filipino Home"
                className={`w-full p-3 border rounded-lg text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-coral/50 ${errors.name ? 'border-red-400 bg-red-50' : 'border-border bg-white'}`}
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Cuisine */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="cuisine">
                Cuisine Type <span className="text-coral">*</span>
              </label>
              <input
                id="cuisine"
                name="cuisine"
                type="text"
                value={form.cuisine}
                onChange={handleChange}
                placeholder="e.g. Punjabi, Filipino, Caribbean, Gujarati"
                className={`w-full p-3 border rounded-lg text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-coral/50 ${errors.cuisine ? 'border-red-400 bg-red-50' : 'border-border bg-white'}`}
              />
              {errors.cuisine && <p className="mt-1 text-sm text-red-600">{errors.cuisine}</p>}
            </div>

            {/* Neighbourhood */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="neighbourhood">
                Neighbourhood <span className="text-coral">*</span>
              </label>
              <select
                id="neighbourhood"
                name="neighbourhood"
                value={form.neighbourhood}
                onChange={handleChange}
                className={`w-full p-3 border rounded-lg text-text-dark focus:outline-none focus:ring-2 focus:ring-coral/50 ${errors.neighbourhood ? 'border-red-400 bg-red-50' : 'border-border bg-white'}`}
              >
                <option value="">Select your neighbourhood…</option>
                {NEIGHBOURHOODS.map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              {errors.neighbourhood && <p className="mt-1 text-sm text-red-600">{errors.neighbourhood}</p>}
            </div>

            {/* Dietary Tags */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Dietary Options <span className="text-text-muted font-normal">(optional)</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {DIETARY_OPTIONS.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.dietary_tags.includes(value)}
                      onChange={() => handleDietaryChange(value)}
                      className="rounded border-border text-coral focus:ring-coral"
                    />
                    <span className="text-sm text-text-dark">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="description">
                Description <span className="text-coral">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={form.description}
                onChange={handleChange}
                placeholder="Tell buyers about your food, your story, and what makes your cooking special…"
                className={`w-full p-3 border rounded-lg text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-coral/50 resize-none ${errors.description ? 'border-red-400 bg-red-50' : 'border-border bg-white'}`}
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-text-dark mb-2">
                Food Photo{' '}
                <span className="text-text-muted font-normal">
                  {isEditing ? '(optional — leave blank to keep your current photo)' : '(optional, max 5MB)'}
                </span>
              </label>
              <div className="flex flex-col gap-3">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full max-h-48 object-cover rounded-lg border border-border"
                  />
                ) : (
                  isEditing && existingPhotoUrl && (
                    <img
                      src={photoUrl(existingPhotoUrl)}
                      alt="Current listing photo"
                      className="w-full max-h-48 object-cover rounded-lg border border-border"
                    />
                  )
                )}
                <label className="cursor-pointer border-2 border-dashed border-border rounded-lg p-4 text-center hover:border-coral/50 transition-colors">
                  <span className="text-2xl block mb-1">📷</span>
                  <span className="text-text-muted text-sm">
                    {photo ? photo.name : isEditing ? 'Click to replace photo' : 'Click to upload a photo'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-coral text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-60 text-lg"
            >
              {loading
                ? (isEditing ? 'Saving changes…' : 'Publishing listing…')
                : (isEditing ? '💾 Save Changes' : '🍽️ Publish My Listing')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}