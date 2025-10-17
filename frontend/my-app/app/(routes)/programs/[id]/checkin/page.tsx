import { isStaff, serverClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function setChecked(programId: string, registrationId: string, checked: boolean) {
  'use server';
  const supabase = await serverClient();
  if (!(await isStaff())) return;

  const { data: userRes } = await supabase.auth.getUser();
  if (!userRes?.user) return;

  if (checked) {
    // Directly update the registration row to CHECKED_IN
    await supabase
      .from('registrations')
      .update({
        status: 'CHECKED_IN',
        checked_in_at: new Date().toISOString(),
        checked_in_by_user_id: userRes.user.id,
      })
      .eq('id', registrationId)
      .eq('program_id', programId);
  } else {
    // Revert to REGISTERED (or leave WAITLISTED as-is if needed). For simplicity, revert to REGISTERED.
    await supabase
      .from('registrations')
      .update({
        status: 'REGISTERED',
        checked_in_at: null,
        checked_in_by_user_id: null,
      })
      .eq('id', registrationId)
      .eq('program_id', programId);
  }

  revalidatePath(`/programs/${programId}/checkin`);
}

export default async function CheckinPage({ params }: { params: { id: string } }) {
  const supabase = await serverClient();
  const admin = await isStaff();
  if (!admin) return <p className="p-6">Forbidden</p>;

  const [programRes, regsRes] = await Promise.all([
    supabase.from('programs').select('id,title').eq('id', params.id).single(),
    supabase
      .from('registrations')
      .select('id,status,created_at,checked_in_at, user:users!registrations_user_id_fkey(id,first_name,last_name,email)')
      .eq('program_id', params.id)
      .in('status', ['REGISTERED','WAITLISTED','CHECKED_IN'])
      .order('created_at', { ascending: true }),
  ]);

  const program = programRes.data;
  const regs = regsRes.data as any[] | null | undefined;
  const loadError = programRes.error || regsRes.error;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Check-in — {program?.title}</h1>
          <Link href={`/programs/${params.id}`} className="text-sm text-blue-600 hover:text-blue-700 transition-colors">Back</Link>
      </div>

      {loadError && (
        <div className="mb-3 rounded bg-red-50 border border-red-200 text-red-700 p-3 text-sm">
          Failed to load registrations. If this is a staff account, make sure the staff policy (0008_regs_staff_all.sql) is applied in Supabase.
          <div className="mt-1 opacity-75">{loadError.message}</div>
        </div>
      )}

      {!loadError && (!regs || regs.length === 0) && (
        <div className="mb-3 rounded bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 text-sm">
          No registrations found yet for this program.
        </div>
      )}

      <div className="bg-white border rounded-md">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 text-left">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Status</th>
              <th className="p-2">Checked in at</th>
              <th className="p-2">Checked in</th>
            </tr>
          </thead>
          <tbody>
            {(regs as any[] ?? []).map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.user?.first_name || ''} {r.user?.last_name || ''}</td>
                <td className="p-2">{r.user?.email}</td>
                <td className="p-2">{r.status}</td>
                <td className="p-2">{r.checked_in_at ? new Date(r.checked_in_at).toLocaleString() : '-'}</td>
                <td className="p-2">
                  <form action={async (fd: FormData) => {
                    'use server';
                    const nextVal = fd.get('checked') === 'on';
                    await setChecked(params.id, r.id, nextVal);
                  }}>
                    <input type="hidden" name="id" value={r.id} />
                    <label className="inline-flex items-center gap-2">
                      <input type="checkbox" name="checked" defaultChecked={r.status === 'CHECKED_IN'} />
                      <span className="text-sm">Present</span>
                    </label>
                    <button type="submit" className="ml-3 text-xs text-blue-600 hover:text-blue-700 underline transition-colors">Save</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
