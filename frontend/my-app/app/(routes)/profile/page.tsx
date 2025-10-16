import { redirect } from 'next/navigation';
import { serverClient } from '@/lib/supabase/server';
import { UserCircle } from 'lucide-react';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';

type ProfileRow = {
  first_name?: string | null;
  last_name?: string | null;
  affiliation?: string | null;
  membership?: any;
  start_date?: string | null;
  expire_date?: string | null;
}

export default async function Profile() {
  const supabase = await serverClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/sign-in');

  const profileRes = await supabase
    .from('users')
    .select('first_name,last_name,affiliation,membership,start_date,expire_date')
    .eq('id', user.id)
    .maybeSingle();

  const profile = (profileRes as any).data as ProfileRow | null;

  const userName = profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || 'Member' : (user.email?.split('@')[0] ?? 'Member');
  const userEmail = user.email ?? '';
  const userId = user.id;

  const membershipType = profile?.membership?.type ?? 'None';
  const startDate = profile?.start_date ?? '-';
  const expireDate = profile?.expire_date ?? '-';
  const hasMembership = !!profile?.membership;

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="max-w-5xl w-full">
        <div className="flex gap-8">
          {/* Left Side - Profile Avatar and Name */}
          <div className="w-64 flex flex-col items-center">
            <div className="mb-4">
              <UserCircle size={150} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-center">{userName}</h2>
            {userId && (
              <p className="text-sm text-gray-600 mt-2">{userId}</p>
            )}
            <SignOutButton />
          </div>

          {/* Right Side - Profile Content */}
          <div className="flex-1">
            {/* Membership Information */}
            <div className="mb-8">
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <span className="font-semibold w-40">Membership Type:</span>
                  <span className="text-gray-600">{membershipType}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-40">Start Date:</span>
                  <span className="text-gray-600">{startDate}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-40">Expire Date:</span>
                  <span className="text-gray-600">{expireDate}</span>
                </div>
              </div>
              {!hasMembership && (
                <Link href="/profile/membership">
                  <button className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors">
                    Add Membership
                  </button>
                </Link>
              )}
            </div>

            {/* Personal Info Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Personal Info</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold w-32">Name:</span>
                  <span className="text-gray-600">{userName}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-32">Email:</span>
                  <span className="text-gray-600">{userEmail}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-32">Affiliation:</span>
                  <span className="text-gray-600">{profile?.affiliation ?? 'Not specified'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
