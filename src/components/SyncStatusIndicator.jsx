import { useEffect, useState } from 'react'
import { Cloud, CloudUpload, CloudOff, CheckCircle2 } from 'lucide-react'
import { useGoogleAuth } from '../context/GoogleAuthContext'

export default function SyncStatusIndicator() {
  const { isSignedIn, syncStatus } = useGoogleAuth()
  const [showSynced, setShowSynced] = useState(false)

  useEffect(() => {
    if (syncStatus === 'synced') {
      setShowSynced(true)
      const t = setTimeout(() => setShowSynced(false), 2500)
      return () => clearTimeout(t)
    }
  }, [syncStatus])

  if (!isSignedIn) return null

  if (syncStatus === 'syncing') {
    return (
      <div className="flex items-center gap-1.5 text-primary-light" title="Saving to Google Drive...">
        <CloudUpload className="w-4 h-4 animate-pulse" />
        <span className="text-[10px] font-medium hidden sm:inline">Saving...</span>
      </div>
    )
  }

  if (syncStatus === 'error') {
    return (
      <div className="flex items-center gap-1.5 text-danger" title="Sync failed">
        <CloudOff className="w-4 h-4" />
        <span className="text-[10px] font-medium hidden sm:inline">Sync failed</span>
      </div>
    )
  }

  if (showSynced) {
    return (
      <div className="flex items-center gap-1.5 text-success" title="Saved to Google Drive">
        <CheckCircle2 className="w-4 h-4" />
        <span className="text-[10px] font-medium hidden sm:inline">Saved</span>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1.5 text-text-muted" title="Connected to Google Drive">
      <Cloud className="w-4 h-4" />
    </div>
  )
}
