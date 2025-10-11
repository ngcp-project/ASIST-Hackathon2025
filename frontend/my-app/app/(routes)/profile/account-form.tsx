'use client'
import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { type User } from '@supabase/supabase-js'
import Avatar from './avatar'

export default function Profile({ user }: { user: User | null }) {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [fullname, setFullname] = useState<string | null>(null)
  const [membership_status, setMembership] = useState<string | null>(null)
  const [avatar_url, setAvatarUrl] = useState<string | null>(null)

  const getProfile = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error, status } = await supabase
                .from('profiles')
                .select(`full_name, membership_status, avatar_url`)
                .eq('id', user?.id)
                .single()
            if (error && status !== 406) {
                console.log(error)
                throw error
            }
            if (data) {
                setFullname(data.full_name)
                setMembership(data.membership_status)
                setAvatarUrl(data.avatar_url)
            }
        } catch (error) {
            alert('Error loading user data!')
        } finally {
            setLoading(false)
        }
    }, [user, supabase])
    useEffect(() => {
        getProfile()
    }, [user, getProfile])

    async function updateProfile({
        fullname,
        avatar_url,
    }: {
        fullname: string | null
        avatar_url: string | null
    }) {
        try {
            setLoading(true)
            const { error } = await supabase.from('profiles').upsert({
                id: user?.id as string,
                full_name: fullname,
                avatar_url,
                updated_at: new Date().toISOString(),
            })
            if (error) throw error
            alert('Profile updated!')
        } catch (error) {
            alert('Error updating the data!')
        } finally {
            setLoading(false)
        }
    }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-6">Profile</h1>
      <div className="space-y-6">
        <p className="text-lg">
          Manage your profile and settings.
        </p>
        {/* Add your profile content here */}

        {/* ... */}

        <div className="form-widget">
            {/* ... */}
            <Avatar
            uid={user?.id ?? null}
            url={avatar_url}
            size={150}
            onUpload={(url) => {
                setAvatarUrl(url)
                updateProfile({ fullname, avatar_url: url })
            }}
            />
            <div>
                <label htmlFor="email">Email: </label>
                <input id="email" type="text" value={user?.email} disabled />
            </div>
            <div>
                <label htmlFor="fullName">Full Name: </label>
                <input
                    id="fullName"
                    type="text"
                    value={fullname || ''}
                    onChange={(e) => setFullname(e.target.value)}
                />
            </div>
        
            <div>
                <button
                    className="button primary block"
                    onClick={() => updateProfile({ fullname, avatar_url })}
                    disabled={loading}
                >
                    {loading ? 'Loading ...' : 'Update'}
                </button>
            </div>
            <div>
                <form action="/auth/signout" method="post">
                    <button className="button block" type="submit">
                        Sign out
                    </button>
                </form>
            </div>
        </div>

      </div>
    </div>
  );
}
