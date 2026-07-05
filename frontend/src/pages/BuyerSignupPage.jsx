// BuyerSignupPage.jsx — buyer registration (Sprint 2)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signupBuyerApi } from '../api';
import { saveToken, saveBuyer } from '../auth';

export default function BuyerSignupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError('Please enter a valid email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');

    setSubmitting(true);
    try {
      const res = await signupBuyerApi({ email, password, name: name || null });
      saveToken(res.token);
      saveBuyer({ id: res.id, email: res.email, name: res.name });
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
        <h1 className="font-serif text-3xl font-bold text-navy mb-2">Sign up as a Buyer</h1>
        <p className="text-gray-500 mb-6">Discover home cooks in your neighbourhood.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Your name (optional)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coral"
              placeholder="Jane Smith" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coral"
              placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coral"
              placeholder="At least 6 characters" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Confirm password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-coral"
              required />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full bg-coral text-white font-medium py-3 rounded-lg hover:bg-opacity-90 transition disabled:opacity-50">
            {submitting ? 'Creating account...' : 'Create buyer account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have a buyer account?{' '}
          <Link to="/buyer/login" className="text-navy font-medium hover:text-coral">Log in</Link>
        </p>
      </div>
    </div>
  );
}