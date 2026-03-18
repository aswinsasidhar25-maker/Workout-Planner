import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'

const GoogleAuthContext = createContext()

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/drive.appdata'

export function GoogleAuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [accessToken, setAccessToken] = useState(null)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const [syncStatus, setSyncStatus] = useState('idle') // idle | syncing | synced | error
  const [gisReady, setGisReady] = useState(false)

  const tokenClientRef = useRef(null)
  const refreshTimeoutRef = useRef(null)

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
          return
        }

        setAccessToken(tokenResponse.access_token)
        setIsSignedIn(true)

        // Fetch user info
        try {
          const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          })
          if (res.ok) {
            const info = await res.json()
            setUser({ name: info.name, email: info.email, picture: info.picture })
          }
        } catch (err) {
          console.error('Failed to fetch user info:', err)
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
