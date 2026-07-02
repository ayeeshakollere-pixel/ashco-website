import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import Landing from './pages/Landing';
import Order from './pages/Order';
import Login from './pages/Login';
import Account from './pages/Account';
import Admin from './pages/Admin';
import Team from './pages/Team';

// Scroll to top whenever the route changes
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Small floating nav shown ONLY to admins/owners, on every page.
// Owners see the Team link; everyone with admin access sees the shop admin.
function StaffNav() {
  const { ready, isAdmin, isOwner } = useAuth();
  const { pathname } = useLocation();
  if (!ready || !isAdmin) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2 rounded-full bg-ashco-black/90 backdrop-blur px-3 py-2 shadow-lg">
      <Link
        to="/admin"
        className={`rounded-full px-3 py-1 text-sm font-semibold ${
          pathname === '/admin' ? 'bg-ashco-yellow text-ashco-black' : 'text-white'
        }`}
      >
        Shop
      </Link>
      {isOwner && (
        <Link
          to="/team"
          className={`rounded-full px-3 py-1 text-sm font-semibold ${
            pathname === '/team' ? 'bg-ashco-yellow text-ashco-black' : 'text-white'
          }`}
        >
          Team
        </Link>
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/order" element={<Order />} />
          <Route path="/login" element={<Login />} />
          <Route path="/account" element={<Account />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/team" element={<Team />} />
        </Routes>
        <StaffNav />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
