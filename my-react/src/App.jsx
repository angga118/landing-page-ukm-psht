import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import LandingPage from './landing/LandingPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={null}>
            <AdminApp />
          </Suspense>
        }
      />
      {/* Catch-all PALING AKHIR agar tidak menelan "/admin/*" */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
