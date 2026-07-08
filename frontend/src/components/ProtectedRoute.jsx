// ProtectedRoute.jsx — Redirects to the right login page if not authenticated
import { Navigate } from 'react-router-dom';
import { isLoggedIn, isSeller, isBuyer } from '../auth';

export default function ProtectedRoute({ children, role }) {
  if (!isLoggedIn()) {
    return <Navigate to={role === 'buyer' ? '/buyer/login' : '/login'} replace />;
  }
  if (role === 'seller' && !isSeller()) {
    return <Navigate to="/login" replace />;
  }
  if (role === 'buyer' && !isBuyer()) {
    return <Navigate to="/buyer/login" replace />;
  }
  return children;
}
