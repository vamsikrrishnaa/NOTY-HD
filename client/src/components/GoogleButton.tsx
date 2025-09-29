import { useEffect, useRef } from 'react'
import { api } from '../lib/api'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function GoogleButton({ text = 'Continue with Google', remember }: { text?: string; remember?: boolean }) {
  const divRef = useRef<HTMLDivElement>(null)
  const { setUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const clientId = (window.__APP_CONFIG__?.GOOGLE_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID || '') as string
    if (!clientId) return

    const id = 'google-client-script'
    if (!document.getElementById(id)) {
      const s = document.createElement('script')
      s.src = 'https://accounts.google.com/gsi/client'
      s.async = true
      s.defer = true
      s.id = id
      document.body.appendChild(s)
      s.onload = render
    } else {
      render()
    }

    function render() {
      if (!window.google || !divRef.current) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (resp: any) => {
          try {
            const r = await api.google(resp.credential, remember)
            setUser(r.user)
            navigate('/dashboard')
          } catch (e) {
            console.error(e)
            alert((e as any).message || 'Google sign-in failed')
          }
        }
      })
      window.google.accounts.id.renderButton(divRef.current, { theme: 'outline', size: 'large', text: 'continue_with' })
    }
  }, [])

  return <div ref={divRef} className="w-full flex justify-center" />
}
