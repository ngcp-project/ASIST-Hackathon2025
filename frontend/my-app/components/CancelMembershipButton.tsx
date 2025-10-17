"use client";

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CancelMembershipButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const onClick = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch('/api/membership/cancel', { method: 'POST' })
      const data = await res.json()
      if (!data.success) {
        setMessage(data.message || 'Failed to cancel membership')
      } else {
        // Refresh profile to show Add Membership button
        router.refresh()
      }
    } catch (e: any) {
      setMessage(e?.message ?? 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <button
        onClick={onClick}
        disabled={loading}
        className={`w-full ${loading ? 'bg-red-300' : 'bg-red-500 hover:bg-red-600'} text-white px-3 py-2 rounded-md transition-colors`}
      >
        {loading ? 'Canceling…' : 'Cancel Membership'}
      </button>
      {message && <div className="mt-2 text-sm text-red-600">{message}</div>}
    </div>
  )
}
