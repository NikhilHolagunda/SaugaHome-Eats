// App.jsx — routing + layout
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import CreateListingPage from './pages/CreateListingPage';
import SellerDetailPage from './pages/SellerDetailPage';

import BuyerSignupPage from './pages/BuyerSignupPage';
import BuyerLoginPage from './pages/BuyerLoginPage';
import SellerMenuPage from './pages/SellerMenuPage';
import BuyerOrdersPage from './pages/BuyerOrdersPage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage />} />

            {/* Seller auth (Sprint 1) */}
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/seller/create-listing" element={<CreateListingPage />} />
            <Route path="/seller/:id" element={<SellerDetailPage />} />

            {/* Buyer auth (Sprint 2) */}
            <Route path="/buyer/signup" element={<BuyerSignupPage />} />
            <Route path="/buyer/login" element={<BuyerLoginPage />} />

            {/* Sprint 2 — ordering */}
            <Route
              path="/seller/menu"
              element={<ProtectedRoute role="seller"><SellerMenuPage /></ProtectedRoute>}
            />
            <Route
              path="/buyer/orders"
              element={<ProtectedRoute role="buyer"><BuyerOrdersPage /></ProtectedRoute>}
            />

            {/* Placeholder — seller order dashboard not built yet */}
            <Route path="/seller/dashboard" element={<Placeholder title="Seller Dashboard" />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

function Placeholder({ title }) {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="font-serif text-3xl font-bold text-navy">{title}</h1>
      <p className="text-text-muted mt-2">Coming in the next step.</p>
    </div>
  );
}

function NotFound() {
  return (
    <div className="max-w-4xl mx-auto p-8 text-center">
      <h1 className="font-serif text-4xl font-bold text-navy">404</h1>
      <p className="text-text-muted mt-2">Page not found.</p>
    </div>
  );
}
