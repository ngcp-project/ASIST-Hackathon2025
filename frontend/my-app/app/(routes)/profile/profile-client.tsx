'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserCircle } from 'lucide-react'

type Initial = {
  email: string
  firstName: string
  lastName: string
  role: string
  affiliation: string
  joinedAt: string | null
  membership: null | {
    type: string
    start: string | null
    end: string | null
    status: 'ACTIVE' | 'EXPIRED' | 'CANCELED'
  }
}

export default function ProfileClient({ initial }: { initial: Initial }) {
  const router = useRouter()
  const supabase = createClient()

  const fullName = useMemo(() => {
    const name = `${initial.firstName ?? ''} ${initial.lastName ?? ''}`.trim()
    return name || 'Guest'
  }, [initial.firstName, initial.lastName])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="max-w-5xl w-full">
        <div className="flex gap-8">
          {/* Left: avatar & name */}
          <div className="w-64 flex flex-col items-center">
            <div className="mb-4">
              <UserCircle size={150} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-center">{fullName}</h2>
            <button
              onClick={handleSignOut}
              className="mt-6 bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors w-1/2"
            >
              Sign Out
            </button>
          </div>

          {/* Right: content */}
          <div className="flex-1">
            {/* Membership */}
            <div className="mb-8">
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <span className="font-semibold w-40">Membership Type:</span>
                  <span className="text-gray-600">
                    {initial.membership?.type ?? 'None'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-40">Start Date:</span>
                  <span className="text-gray-600">
                    {initial.membership?.start ? new Date(initial.membership.start).toLocaleDateString() : '-'}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-40">Expire Date:</span>
                  <span className="text-gray-600">
                    {initial.membership?.end ? new Date(initial.membership.end).toLocaleDateString() : '-'}
                  </span>
                </div>
              </div>
              <a
                className="inline-block bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
                href="/memberships"
              >
                Add Membership
              </a>
            </div>

            {/* Personal info */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Personal Info</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold w-32">Name:</span>
                  <span className="text-gray-600">{fullName}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-32">Email:</span>
                  <span className="text-gray-600">{initial.email}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-32">Role:</span>
                  <span className="text-gray-600">{initial.role}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-32">Affiliation:</span>
                  <span className="text-gray-600">{initial.affiliation || '—'}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-32">Joined:</span>
                  <span className="text-gray-600">
                    {initial.joinedAt ? new Date(initial.joinedAt).toLocaleDateString() : '—'}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
