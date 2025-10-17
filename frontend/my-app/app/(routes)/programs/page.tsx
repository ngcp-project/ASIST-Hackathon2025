import { isStaff, serverClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { revalidatePath } from 'next/cache';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function createProgram(formData: FormData) {
  'use server';
  const supabase = await serverClient();
  const admin = await isStaff();
  if (!admin) return;
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const location = String(formData.get('location') || '').trim();
  const capacity = Number(formData.get('capacity') || 0);
  const start_at = String(formData.get('start_at') || '');
  const end_at = String(formData.get('end_at') || '');
  const visibility = String(formData.get('visibility') || 'PUBLIC');
  if (!title || !start_at || !end_at) return;
  await supabase.from('programs').insert({
    title,
    description: description || null,
    location: location || null,
    capacity: isNaN(capacity) ? 0 : capacity,
    start_at,
    end_at,
    publish_at: new Date().toISOString(),
    // If not explicitly provided, default unpublish_at to end_at
    unpublish_at: end_at || null,
    visibility: (visibility as any) ?? 'PUBLIC',
    delivery_mode: 'IN_PERSON',
  });
  revalidatePath('/programs');
}

export default async function Programs() {
  const supabase = await serverClient();
  const admin = await isStaff();
  const nowIso = new Date().toISOString();
  const { data: programs } = await supabase
    .from('programs')
    .select('id,title,location,start_at,end_at,publish_at,unpublish_at')
    // Explicitly filter by publish/unpublish window so staff also see only “online” items by default
    .or(`publish_at.is.null,publish_at.lte.${nowIso}`)
    .or(`unpublish_at.is.null,unpublish_at.gt.${nowIso}`)
    .order('start_at', { ascending: true });

  const list = (programs as any) ?? [];
  // Participation counts: only compute for admins (RLS allows staff to read registrations)
  const ids = list.map((p: any) => p.id);
  let counts: Record<string, number> = {};
  if (admin && ids.length > 0) {
    const { data: regs } = await supabase
      .from('registrations')
      .select('program_id,status')
      .in('program_id', ids)
      .in('status', ['REGISTERED','CHECKED_IN']);
    for (const r of (regs as any[] ?? [])) {
      counts[r.program_id] = (counts[r.program_id] ?? 0) + 1;
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-gray-300 to-green-600 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-md">
            {/* Header */}
            <div className="mb-4">
              <h1 className="text-3xl sm:text-3xl md:text-3xl font-bold tracking-tight text-gray-900 text-center">Programs & Activities</h1>
              <p className="text-sm text-gray-600 mt-1 text-center">Explore and register for upcoming events.</p>
            {/* Admin: Create Program */}
            {admin && (
              <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h2 className="text-sm font-medium text-gray-800 mb-3">Create a Program</h2>
                <form action={createProgram} className="flex flex-wrap items-end gap-3">
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600">Title</label>
                    <input name="title" className="border rounded px-2 py-1 text-sm" placeholder="New program" required />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600">Location</label>
                    <input name="location" className="border rounded px-2 py-1 text-sm" placeholder="Room" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600">Capacity</label>
                    <input name="capacity" type="number" min={0} defaultValue={0} className="border rounded px-2 py-1 w-24 text-sm" />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600">Start</label>
                    <input name="start_at" type="datetime-local" className="border rounded px-2 py-1 text-sm" required />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600">End</label>
                    <input name="end_at" type="datetime-local" className="border rounded px-2 py-1 text-sm" required />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600">Visibility</label>
                    <select name="visibility" defaultValue="PUBLIC" className="border rounded px-2 py-1 text-sm">
                      <option value="PUBLIC">PUBLIC</option>
                      <option value="STUDENTS_ONLY">STUDENTS_ONLY</option>
                      <option value="MEMBERS_ONLY">MEMBERS_ONLY</option>
                      <option value="INTERNAL">INTERNAL</option>
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs text-gray-600">Description</label>
                    <input name="description" className="border rounded px-2 py-1 text-sm w-56" placeholder="Optional" />
                  </div>
                  <button type="submit" className="bg-green-600 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-green-700 transition-colors">Add</button>
                </form>
              </div>
            )}

            </div>
            {/* Program list */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              {list.length === 0 ? (
                <p className="text-gray-600">No upcoming programs yet.</p>
              ) : (
                <div className="w-full space-y-3">
                  {list.map((program: any) => {
                    const start = new Date(program.start_at);
                    const end = new Date(program.end_at);
                    return (
                      <Link
                        key={program.id}
                        href={`/programs/${program.id}`}
                        className="block w-full border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition p-4 hover:border-gray-300"
                      >
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                          {/* Left: title + description */}
                          <div className="min-w-0">
                            <h2 className="text-lg font-semibold text-gray-900">{program.title}</h2>
                            {program.description && (
                              <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                                {program.description}
                              </p>
                            )}
                          </div>

                          {/* Right: meta */}
                          <div className="text-sm text-gray-500 shrink-0 md:text-right">
                            {program.location && (
                              <p className="mb-1">📍 {program.location}</p>
                            )}
                            <p>
                              <strong>Time:</strong> {start.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                              {' '}–{' '}
                              {end.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                            {admin && (
                              <p className="mt-1">
                                <strong>Participants:</strong>{' '}
                                {(counts[program.id] ?? 0)}
                              </p>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
