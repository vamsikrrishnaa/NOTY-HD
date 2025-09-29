import { useEffect, useState } from 'react'
import { z } from 'zod'
import { api, ApiError } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import GoogleButton from '../components/GoogleButton'
import FloatingInput from '../components/FloatingInput'

const emailSchema = z.object({ email: z.string().email('Enter a valid email') })

export default function Signin() {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remember, setRemember] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const navigate = useNavigate()
  const { setUser } = useAuth()

  useEffect(() => { setError(null) }, [email, otp])

  const getOtp = async () => {
    setLoading(true); setError(null)
    const parsed = emailSchema.safeParse({ email })
    if (!parsed.success) { setLoading(false); setError(parsed.error.issues[0].message); return }
    try {
      await api.requestOtp({ purpose: 'login', email: parsed.data.email })
      setSent(true)
    } catch (e) {
      setError((e as ApiError).message || 'Failed to send OTP')
    } finally { setLoading(false) }
  }

  const submit = async () => {
    setLoading(true); setError(null)
    try {
      const r = await api.verifyOtp({ purpose: 'login', email, otp, remember })
      setUser(r.user)
      navigate('/dashboard')
    } catch (e) {
      setError((e as ApiError).message || 'Sign in failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden grid place-items-center lg:place-items-stretch px-4 lg:px-0 py-6 lg:py-0">
      <div className="container-auth relative w-full max-w-7xl h-full gap-8 lg:gap-12 lg:items-stretch lg:mx-auto">
        {/* Desktop brand pinned top-left of the grid */}
        <div className="hidden lg:flex items-center gap-2 absolute top-12 left-12">
          <img src="/logo.png" alt="HD" className="w-6 h-6" />
          <span className="font-semibold">HD</span>
        </div>
        <div className="card lg:bg-transparent lg:shadow-none lg:px-12 lg:py-0 lg:rounded-none lg:self-center lg:justify-self-center lg:max-w-[520px] lg:w-full lg:h-full lg:flex lg:flex-col lg:justify-center lg:overflow-y-auto">
          {/* Mobile brand inside flow */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <img src="/logo.png" alt="HD" className="w-6 h-6" />
            <span className="font-semibold">HD</span>
          </div>
          <h1 className="text-2xl font-semibold mb-1">Sign in</h1>
          <p className="text-sm text-gray-500 mb-6">Please login to continue to your account.</p>

          <FloatingInput label="Email" type="email" value={email} onChange={setEmail} className="mb-3" />

          <FloatingInput
            label="OTP"
            type={showOtp ? 'text' : 'password'}
            value={otp}
            onChange={setOtp}
            className="mb-3"
            rightIcon={showOtp ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.11 1 12c.51-1.18 1.2-2.27 2.05-3.24M9.9 4.24A10.94 10.94 0 0 1 12 4c5 0 9.27 3.89 11 8-."></path><path d="M1 1l22 22"></path></svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path><circle cx="12" cy="12" r="3"></circle></svg>
            )}
            onRightClick={() => setShowOtp(v => !v)}
            rightAriaLabel={showOtp ? 'Hide OTP' : 'Show OTP'}
          />

          {!sent ? (
            <button className="btn-primary mb-2" disabled={loading} onClick={getOtp}>{loading ? 'Sending...' : 'Get OTP'}</button>
          ) : (
            <>
              <div className="flex items-center gap-2 my-2">
                <input id="remember" type="checkbox" className="h-4 w-4" checked={remember} onChange={e=>setRemember(e.target.checked)} />
                <label htmlFor="remember" className="text-sm text-gray-700 select-none">Keep me logged in</label>
              </div>
              <button className="btn-primary" disabled={loading} onClick={submit}>{loading ? 'Signing in...' : 'Sign in'}</button>
              <button className="mt-2 text-sm link" onClick={getOtp}>Resend OTP</button>
            </>
          )}

          {error && <div className="text-red-600 text-sm mt-3">{error}</div>}

          <div className="mt-4 text-sm">
            Need an account? <Link to="/signup" className="link">Create one</Link>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px bg-gray-200 flex-1" />
            <span className="text-xs text-gray-500">OR</span>
            <div className="h-px bg-gray-200 flex-1" />
          </div>

          <GoogleButton text="Sign in with Google" remember={remember} />
        </div>
        <div className="hidden lg:block rounded-l-2xl overflow-hidden lg:self-stretch w-full h-full">
          <img src="/win.png" alt="Hero" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  )
}
