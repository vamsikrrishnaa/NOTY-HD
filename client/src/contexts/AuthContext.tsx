import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api'

export type User = { id: string; name: string; email: string; provider: string }

type Ctx = {
  user: User | null
  loading: boolean
  setUser: React.Dispatch<React.SetStateAction<User | null>>
  logout: () => Promise<void>
}

const AuthCtx = createContext<Ctx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.me().then(r => setUser(r.user)).catch(() => setUser(null)).finally(() => setLoading(false))
  }, [])

  const logout = async () => {
    await api.logout()
    setUser(null)
  }

  return (
    <AuthCtx.Provider value={{ user, setUser, loading, logout }}>{children}</AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
