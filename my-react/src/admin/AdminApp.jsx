import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { ToastProvider } from './components/Toast.jsx'
import Layout from './components/Layout.jsx'
import LoginPage from './pages/LoginPage.jsx'
import OverviewPage from './pages/OverviewPage.jsx'
import HeroPage from './pages/HeroPage.jsx'
import SejarahPage from './pages/SejarahPage.jsx'
import PengurusPage from './pages/PengurusPage.jsx'
import PrestasiPage from './pages/PrestasiPage.jsx'
import GaleriPage from './pages/GaleriPage.jsx'
import KontakPage from './pages/KontakPage.jsx'

function RequireAuth({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-50">
        <div className="rounded-xl border bg-white px-6 py-4 text-sm text-ink-600">Memuat sesi...</div>
      </div>
    )
  }
  if (!user) return <Navigate to="/admin/login" replace />
  return children
}

function LoginRoute() {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink-900">
        <div className="text-sm text-white/70">Memuat...</div>
      </div>
    )
  }
  if (user) return <Navigate to="/admin/overview" replace />
  return <LoginPage />
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<LoginRoute />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="beranda" element={<HeroPage />} />
        <Route path="sejarah" element={<SejarahPage />} />
        <Route path="pengurus" element={<PengurusPage />} />
        <Route path="prestasi" element={<PrestasiPage />} />
        <Route path="galeri" element={<GaleriPage />} />
        <Route path="kontak" element={<KontakPage />} />
        <Route path="*" element={<Navigate to="overview" replace />} />
      </Route>
    </Routes>
  )
}

export default function AdminApp() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AdminRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}
