// SignupPage.jsx — Seller registration (US-01)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupApi } from '../api';
import { saveSellerSession } from '../auth';

export default function SignupPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) errs.email = 'Email is required';
    else if (!emailRegex.test(form.email)) errs.email = 'Please enter a valid email address';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (!form.confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
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
      const data = await signupApi({ email: form.email, password: form.password });
      saveSellerSession(data.token, { id: data.id, email: data.email });
      navigate('/seller/create-listing');
    } catch (err) {
      setServerError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors(prev => ({ ...prev, [e.target.name]: '' }));
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4 py-12">
      <div className="bg-card-bg rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-4xl">🍱</span>
          <h1 className="font-serif text-3xl font-bold text-navy mt-3 mb-2">
            Join SaugaHomeEats
          </h1>
          <p className="text-text-muted">Start sharing your home cooking with your neighbours</p>
        </div>

        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-6 text-sm">
            {serverError}
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
              className={`w-full p-3 border rounded-lg text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-coral/50 transition ${errors.email ? 'border-red-400 bg-red-50' : 'border-border bg-white'}`}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              className={`w-full p-3 border rounded-lg text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-coral/50 transition ${errors.password ? 'border-red-400 bg-red-50' : 'border-border bg-white'}`}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-dark mb-1" htmlFor="confirmPassword">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat your password"
              className={`w-full p-3 border rounded-lg text-text-dark placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-coral/50 transition ${errors.confirmPassword ? 'border-red-400 bg-red-50' : 'border-border bg-white'}`}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-coral text-white font-semibold py-3 px-6 rounded-lg hover:bg-red-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-lg mt-2"
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-text-muted text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-coral font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}