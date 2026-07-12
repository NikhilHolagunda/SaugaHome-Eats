// LoginPage.jsx — Seller login (US-01)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginApi } from '../api';
import { saveSellerSession } from '../auth';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Please enter your email and password');
      return;
    }

    setLoading(true);
    try {
      const data = await loginApi({ email: form.email, password: form.password });
      saveSellerSession(data.token, { id: data.id, email: data.email });
      navigate(data.hasListing ? '/' : '/seller/create-listing');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="bg-card-bg rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🍱</span>
          <h1 className="font-serif text-3xl font-bold text-navy mt-3 mb-2">Welcome back</h1>
          <p className="text-text-muted">Log in to manage your listing</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full p-3 border border-border rounded-lg bg-white text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-coral/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              className="w-full p-3 border border-border rounded-lg bg-white text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-coral/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-coral text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-60 text-lg"
          >
            {loading ? 'Logging in…' : 'Log In'}
          </button>
        </form>

        <p className="text-center text-text-muted text-sm mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-coral font-medium hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}