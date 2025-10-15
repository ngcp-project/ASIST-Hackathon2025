//Profile page component using Supabase for authentication and user data management.
import { serverClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SignOutButton from './signout-button'

export default async function Profile() {
  const supabase = await serverClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // You can also fetch from your users table
  const { data: profile } = await supabase
    .from('users')
    .select('first_name,last_name,email,role,affiliation,created_at')
    .eq('id', user.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Profile</h1>
      <div className="space-y-3 text-lg">
        <p><strong>Email:</strong> {profile?.email ?? user.email}</p>
        <p><strong>Name:</strong> {profile?.first_name ?? ''} {profile?.last_name ?? ''}</p>
        <p><strong>Role:</strong> {profile?.role ?? 'MEMBER'}</p>
        <p><strong>Affiliation:</strong> {profile?.affiliation ?? '—'}</p>
        <p className="text-sm opacity-70">Joined: {profile?.created_at?.toString() ?? '—'}</p>
      </div>

      <div className="mt-6">
        <SignOutButton />
      </div>
    </div>
  )
}
