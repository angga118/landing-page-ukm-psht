import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { ApiError } from '../../lib/api.js'

export default function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  if (!loading && user) {
    return <Navigate to="/admin/overview" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMsg('')
    setFieldErrors({})
    if (!username.trim() || !password) {
      setErrorMsg('Username dan password wajib diisi.')
      return
    }
    setSubmitting(true)
    try {
      await login(username.trim(), password)
      navigate('/admin/overview', { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message || 'Login gagal')
        if (err.errors) setFieldErrors(err.errors)
      } else {
        setErrorMsg(err.message || 'Terjadi kesalahan')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-900 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl md:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gold-500 text-ink-900 font-bold">PS</div>
          <h1 className="mt-3 text-xl font-bold text-ink-900">Login Admin</h1>
          <p className="mt-1 text-sm text-ink-600">UKM PSHT — masuk untuk mengelola konten</p>
        </div>

        {errorMsg && (
          <div className="mb-4 rounded-lg border border-danger-200 bg-danger-50 px-3 py-2.5 text-sm text-danger-700">{errorMsg}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Username</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="admin"
              className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
            />
            {fieldErrors.username && <p className="mt-1 text-xs text-danger-600">{fieldErrors.username}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 pr-10 text-sm outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                aria-pressed={showPassword}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-neutral-500 transition-colors hover:text-neutral-700 focus-ring-light"
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.6a3 3 0 004.2 4.2" />
                    <path d="M9.4 5.2A9.5 9.5 0 0112 5c6.5 0 10 7 10 7a17 17 0 01-3.2 4.0" />
                    <path d="M6.1 6.1A17 17 0 002 12s3.5 7 10 7a9.4 9.4 0 004.9-1.4" />
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && <p className="mt-1 text-xs text-danger-600">{fieldErrors.password}</p>}
          </div>
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full rounded-lg bg-gold-500 px-4 py-3 text-sm font-bold text-ink-900 hover:bg-gold-400 disabled:opacity-60"
          >
            {submitting ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
      </div>
    </div>
  )
}
