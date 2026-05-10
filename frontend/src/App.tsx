import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { authApi } from './api/auth';
import { useAuthStore } from './store/auth.store';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import DiscoverPage from './pages/DiscoverPage';
import SearchPage from './pages/SearchPage';
import CreatePostPage from './pages/CreatePostPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import SavedPage from './pages/SavedPage';
import PostDetailPage from './pages/PostDetailPage';
import CreatorDashboardPage from './pages/CreatorDashboardPage';
import AdminCreateCreatorPage from './pages/AdminCreateCreatorPage';

const qc = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { token, setAuth, logout } = useAuthStore();

  useEffect(() => {
    if (!token) return;
    authApi.me()
      .then((user) => setAuth(user, token))
      .catch(() => logout());
  }, []);

  return <>{children}</>;
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireCreator({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  if (user?.role !== 'creator') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function GuestOnly({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function RoleHome() {
  const { user } = useAuthStore();
  return user?.role === 'creator' ? <CreatorDashboardPage /> : <FeedPage />;
}

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />
            <Route path="/admin/create-creator" element={<AdminCreateCreatorPage />} />

            <Route path="/" element={<RequireAuth><RoleHome /></RequireAuth>} />
            <Route path="/discover" element={<RequireAuth><DiscoverPage /></RequireAuth>} />
            <Route path="/search" element={<RequireAuth><SearchPage /></RequireAuth>} />
            <Route path="/notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
            <Route path="/saved" element={<RequireAuth><SavedPage /></RequireAuth>} />
            <Route path="/p/:id" element={<RequireAuth><PostDetailPage /></RequireAuth>} />
            <Route path="/profile/:username" element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="/account/edit" element={<RequireAuth><EditProfilePage /></RequireAuth>} />
            <Route
              path="/create"
              element={<RequireAuth><RequireCreator><CreatePostPage /></RequireCreator></RequireAuth>}
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
    </QueryClientProvider>
  );
}
