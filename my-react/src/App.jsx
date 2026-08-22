import { Routes, Route } from 'react-router-dom'
import LandingPage from './landing/LandingPage.jsx'
import AdminApp from './admin/AdminApp.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/admin/*" element={<AdminApp />} />
    </Routes>
  )
}
