// App.jsx — Routes + layout shell
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import CreateListingPage from './pages/CreateListingPage';
import SellerDetailPage from './pages/SellerDetailPage';

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-6">🔍</div>
        <h1 className="font-serif text-3xl text-navy mb-3">Page not found</h1>
        <p className="text-text-muted mb-6">The page you're looking for doesn't exist.</p>
        <a href="/" className="bg-coral text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-500 transition-colors inline-block">
          Go home
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-cream">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/seller/create-listing" element={<CreateListingPage />} />
            <Route path="/seller/:id" element={<SellerDetailPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
