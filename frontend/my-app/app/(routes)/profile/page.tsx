import { redirect } from 'next/navigation';
import { serverClient } from '@/lib/supabase/server';
import { UserCircle } from 'lucide-react';
import Link from 'next/link';
import SignOutButton from '@/components/SignOutButton';
import CancelMembershipButton from '@/components/CancelMembershipButton';

type ProfileRow = {
  first_name?: string | null;
  last_name?: string | null;
  affiliation?: string | null;
  membership?: any;
  start_date?: string | null;
  expire_date?: string | null;
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Profile() {
  const supabase = await serverClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return redirect('/sign-in');

  const profileRes = await supabase
    .from('users')
    .select('first_name,last_name,affiliation')
    .eq('id', user.id)
    .maybeSingle();

  const profile = (profileRes as any).data as ProfileRow | null;
  const nameFromProfile = profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() : '';
  const userName = nameFromProfile || (user.email?.split('@')[0] ?? 'Member');
  const userEmail = user.email ?? '';
  const userId = user.id;

  // Fetch active membership transaction (canonical source)
  let txnRes = await supabase
    .from('transactions')
    .select('id,plan_id,price,start_date,end_date,status')
    .eq('user_id', user.id)
    .eq('status', 'ACTIVE')
    .lte('start_date', new Date().toISOString().slice(0,10))
    .gte('end_date', new Date().toISOString().slice(0,10))
    .order('purchased_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  let activeTxn = (txnRes as any).data ?? null;

  // Fallback: if trigger hasn’t populated dates yet, show the latest ACTIVE txn regardless of date window
  if (!activeTxn) {
    const latestRes = await supabase
      .from('transactions')
      .select('id,plan_id,price,start_date,end_date,status')
      .eq('user_id', user.id)
      .eq('status', 'ACTIVE')
      .order('purchased_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    activeTxn = (latestRes as any).data ?? null;
  }
  const hasMembership = !!activeTxn;
  // Fetch plan name for friendly display when we have a plan_id
  let membershipType = 'None';
  if (activeTxn?.plan_id) {
    const planRes = await supabase
      .from('membership_plans')
      .select('name')
      .eq('id', activeTxn.plan_id)
      .maybeSingle();
    membershipType = (planRes as any).data?.name ?? String(activeTxn.plan_id);
  }
  const startDate = activeTxn ? String(activeTxn.start_date) : '-';
  const expireDate = activeTxn ? String(activeTxn.end_date) : '-';

  // Fetch registration history (join with programs)
  const regsRes = await supabase
    .from('registrations')
    .select('id,status,created_at,programs(id,title,start_at,end_at)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const registrations = (regsRes as any).data ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-gray-300 to-green-600 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl p-6 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              {/* Left: Avatar + stacked Membership and Personal Info */}
              <div className="md:col-span-1">
                <div className="flex flex-col items-center">
                  <UserCircle size={96} className="text-gray-400 mb-3" />
                  <h2 className="text-lg font-semibold">{userName}</h2>
                  <p className="text-xs text-gray-500 mb-2">{userEmail}</p>
                  <div className="mt-2 w-full flex justify-center">
                    <SignOutButton />
                  </div>
                </div>

                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Membership</h4>
                  <div className="text-sm text-gray-700">
                    {hasMembership ? (
                      <>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Type</span>
                          <span className="font-medium">{membershipType}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Start</span>
                          <span className="text-gray-600">{startDate}</span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-gray-600">Expires</span>
                          <span className="text-gray-600">{expireDate}</span>
                        </div>
                        <div className="mt-4">
                          <CancelMembershipButton />
                        </div>
                      </>
                    ) : (
                      <div className="mt-3">
                        <Link href="/profile/membership">
                          <button className="w-full bg-green-500 text-white px-3 py-2 rounded-md hover:bg-green-600 transition-colors">Add Membership</button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Personal Info</h4>
                  <div className="text-sm text-gray-700">
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Name</span>
                      <span className="font-medium">{userName}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Email</span>
                      <span className="text-gray-600">{userEmail}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-gray-600">Affiliation</span>
                      <span className="text-gray-600">{profile?.affiliation ?? 'Not specified'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Registration history (wider) */}
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold mb-3">Registration History</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  {registrations.length === 0 ? (
                    <p className="text-gray-600">You have no registrations yet.</p>
                  ) : (
                    <ul className="space-y-2">
                      {registrations.map((r: any) => (
                        <li key={r.id} className="flex justify-between items-start p-3 bg-white rounded-md shadow-sm">
                          <div>
                            <div className="font-medium">{r.programs?.title ?? 'Program'}</div>
                            <div className="text-xs text-gray-500">{r.status} • {new Date(r.created_at).toLocaleString()}</div>
                          </div>
                          <div className="text-sm text-gray-500">{r.programs?.start_at ? new Date(r.programs.start_at).toLocaleDateString() : ''}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
