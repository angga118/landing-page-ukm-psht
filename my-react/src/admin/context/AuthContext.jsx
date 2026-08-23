import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { api, ApiError } from '../../lib/api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const checkMe = useCallback(async () => {
    setLoading(true)
    try {
      const data = await api.get('/admin/me')
      setUser(data?.user || data || null)
      setError(null)
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setUser(null)
      } else {
        setError(e.message)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const data = await api.get('/admin/me')
        if (cancelled) return
        setUser(data?.user || data || null)
        setError(null)
      } catch (e) {
        if (cancelled) return
        if (e instanceof ApiError && e.status === 401) {
          setUser(null)
        } else {
          setError(e.message)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = async (username, password) => {
    const data = await api.post('/admin/login', { username, password })
    const u = data?.user || data
    setUser(u)
    return u
  }

  const logout = async () => {
    try {
      await api.post('/admin/logout', {})
    } finally {
      setUser(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, checkMe, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- ko-lokasi hook+provider disengaja, pola standar React context
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus di dalam AuthProvider')
  return ctx
}
