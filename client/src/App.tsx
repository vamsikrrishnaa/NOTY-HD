import { Route, Routes, Navigate, Link } from 'react-router-dom'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import Dashboard from './pages/Dashboard'
import { AuthProvider, useAuth } from './contexts/AuthContext'

function Protected({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>
  if (!user) return <Navigate to="/signin" replace />
  return children
}

function Public({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>
  if (user) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/signup" />} />
          <Route path="/signup" element={<Public><Signup /></Public>} />
          <Route path="/signin" element={<Public><Signin /></Public>} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="*" element={<div className='p-6'>Not found. <Link className='link' to="/">Go home</Link></div>} />
        </Routes>
      </div>
    </AuthProvider>
  )
}
