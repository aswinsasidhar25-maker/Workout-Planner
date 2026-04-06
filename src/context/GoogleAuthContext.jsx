import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const GoogleAuthContext = createContext()

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata openid profile email'

const SESSION_KEY = 'onefit-session'
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000 // 7 days

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (Date.now() - session.startedAt > SESSION_MAX_AGE) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

function saveSession(user) {
  const existing = loadSession()
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    user,
    startedAt: existing?.startedAt || Date.now(),
  }))
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function GoogleAuthProvider({ children }) {
  const savedSession = loadSession()
  const [user, setUser] = useState(savedSession?.user || null)
  const [accessToken, setAccessToken] = useState(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | synced | error
  const [gisReady, setGisReady] = useState(false)

  const tokenClientRef = useRef(null)
  const refreshTimeoutRef = useRef(null)
  const hasAttemptedRestore = useRef(false)

  // Wait for GIS library to load
  useEffect(() => {
    if (window.google?.accounts?.oauth2) {
      setGisReady(true)
      return
    }

    const checkInterval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        setGisReady(true)
        clearInterval(checkInterval)
      }
    }, 200)

    return () => clearInterval(checkInterval)
  }, [])

  // Initialize token client once GIS is ready
  useEffect(() => {
    if (!gisReady || !CLIENT_ID) return

    tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
      client_id: CLIENT_ID,
      scope: SCOPES,
      callback: async (tokenResponse) => {
        if (tokenResponse.error) {
          console.error('Token error:', tokenResponse.error)
          setIsSignedIn(false)
          setAccessToken(null)
          setUser(null)
          clearSession()
          return
        }

        setAccessToken(tokenResponse.access_token)
        setIsSignedIn(true)

        // Fetch user info only if we don't already have it from session
        const currentSession = loadSession()
        if (currentSession?.user) {
          setUser(currentSession.user)
          saveSession(currentSession.user)
        } else {
          try {
            const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
            })
            if (res.ok) {
              const info = await res.json()
              const userInfo = { name: info.name, email: info.email, picture: info.picture }
              setUser(userInfo)
              saveSession(userInfo)
            }
          } catch (err) {
            console.error('Failed to fetch user info:', err)
          }
        }

        // Schedule token refresh ~5 min before expiry
        if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
        const expiresIn = tokenResponse.expires_in || 3600
        const refreshIn = Math.max((expiresIn - 300) * 1000, 60000)
        refreshTimeoutRef.current = setTimeout(() => {
          if (tokenClientRef.current) {
            tokenClientRef.current.requestAccessToken({ prompt: '' })
          }
        }, refreshIn)
      },
    })

    // Auto-restore session: silently request a new token if session is still valid
    if (!hasAttemptedRestore.current && loadSession()) {
      hasAttemptedRestore.current = true
      tokenClientRef.current.requestAccessToken({ prompt: '' })
    }

    return () => {
      if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
    }
  }, [gisReady])

  const signIn = useCallback(() => {
    if (tokenClientRef.current) {
      tokenClientRef.current.requestAccessToken()
    }
  }, [])

  const signOut = useCallback(async () => {
    if (accessToken) {
      try {
        await fetch(`https://oauth2.googleapis.com/revoke?token=${accessToken}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        })
      } catch {
        // revoke failure is non-critical
      }
    }
    if (refreshTimeoutRef.current) clearTimeout(refreshTimeoutRef.current)
    setAccessToken(null)
    setUser(null)
    setIsSignedIn(false)
    setSyncStatus('idle')
    clearSession()
  }, [accessToken])

  const value = {
    user,
    accessToken,
    isSignedIn,
    syncStatus,
    setSyncStatus,
    signIn,
    signOut,
    gisReady: gisReady && CLIENT_ID && CLIENT_ID !== 'YOUR_CLIENT_ID_HERE',
  }

  return (
    <GoogleAuthContext.Provider value={value}>
      {children}
    </GoogleAuthContext.Provider>
  )
}

export function useGoogleAuth() {
  const ctx = useContext(GoogleAuthContext)
  if (!ctx) throw new Error('useGoogleAuth must be used within GoogleAuthProvider')
  return ctx
}
