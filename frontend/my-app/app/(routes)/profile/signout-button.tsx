'use client'
import { createClient } from '@/lib/supabase/client'

export default function SignOutButton() {
  const supabase = createClient()
  return (
    <button
      className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
      onClick={async () => { await supabase.auth.signOut(); window.location.href = '/' }}
    >
      Sign Out
    </button>
  )
}
