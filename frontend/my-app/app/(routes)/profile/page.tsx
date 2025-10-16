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
    .select('first_name,last_name,affiliation')
    .eq('id', user.id)
    .maybeSingle();

  const profile = (profileRes as any).data as ProfileRow | null;
  const nameFromProfile = profile ? `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() : '';
  const userName = nameFromProfile || (user.email?.split('@')[0] ?? 'Member');
  const userEmail = user.email ?? '';
  const userId = user.id;

  // Fetch active membership transaction (canonical source)
  const txnRes = await supabase
    .from('transactions')
    .select('id,plan_id,price,start_date,end_date,status')
    .eq('user_id', user.id)
    .eq('status', 'ACTIVE')
    .lte('start_date', new Date().toISOString().slice(0,10))
    .gte('end_date', new Date().toISOString().slice(0,10))
    .order('purchased_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const activeTxn = (txnRes as any).data ?? null;
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
            </div>

            {/* Registration History */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">Registration History</h3>
              {registrations.length === 0 ? (
                <p className="text-gray-600">You have no registrations yet.</p>
              ) : (
                <ul className="space-y-3">
                  {registrations.map((r: any) => (
                    <li key={r.id} className="border p-3 rounded">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold">{r.programs?.title ?? 'Program'}</div>
                          <div className="text-sm text-gray-600">{r.status} • {new Date(r.created_at).toLocaleString()}</div>
                        </div>
                        <div className="flex items-center">
                          <div className="text-sm text-gray-500">{r.programs?.start_at ? new Date(r.programs.start_at).toLocaleDateString() : ''}</div>
                          {/* cancellation disabled in UI for now */}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
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
