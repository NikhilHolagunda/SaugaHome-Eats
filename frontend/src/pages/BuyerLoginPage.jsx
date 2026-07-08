// BuyerLoginPage.jsx — buyer login (Sprint 2)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginBuyerApi } from '../api';
import { saveBuyerSession } from '../auth';

export default function BuyerLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await loginBuyerApi({ email, password });
      saveBuyerSession(res.token, { id: res.id, email: res.email, name: res.name });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="font-serif text-3xl font-bold text-navy mb-2">Buyer Log in</h1>
        <p className="text-gray-500 mb-6">Welcome back.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coral" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coral" required />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full bg-coral text-white font-medium py-3 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50">
            {submitting ? 'Signing in...' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          New here?{' '}
          <Link to="/buyer/signup" className="text-navy font-medium hover:text-coral">Create a buyer account</Link>
        </p>
        <p className="text-center text-xs text-gray-500 mt-2">
          Are you a home cook? <Link to="/login" className="hover:text-coral">Seller login</Link>
        </p>
      </div>
    </div>
  );
}
