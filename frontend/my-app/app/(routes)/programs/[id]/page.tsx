import { isStaff, serverClient } from "@/lib/supabase/server";
import Link from "next/link";
import ProgramRegisterClient from '@/components/ProgramRegisterClient';
import { revalidatePath } from "next/cache";
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function saveProgram(id: string, formData: FormData) {
  'use server';
  const supabase = await serverClient();
  if (!(await isStaff())) return;
  const title = String(formData.get('title') || '').trim();
  const description = String(formData.get('description') || '').trim();
  const location = String(formData.get('location') || '').trim();
  const capacity = Number(formData.get('capacity') || 0);
  const start_at = String(formData.get('start_at') || '');
  const end_at = String(formData.get('end_at') || '');
  const visibility = String(formData.get('visibility') || '').trim() || null;
  const delivery_mode = String(formData.get('delivery_mode') || '').trim() || null;
  const status = String(formData.get('status') || '').trim() || null;
  const publish_at = String(formData.get('publish_at') || '');
  const unpublish_at = String(formData.get('unpublish_at') || '');
  const waiver_text = String(formData.get('waiver_text') || '').trim();
  // If unpublish_at not provided, default to end_at so the program disappears at its end time
  const computedUnpublishAt = unpublish_at || (end_at || '');
  await supabase
    .from('programs')
    .update({
      title: title || null,
      description: description || null,
      location: location || null,
      capacity: isNaN(capacity) ? 0 : capacity,
      start_at: start_at || null,
      end_at: end_at || null,
      visibility: visibility as any,
      delivery_mode: delivery_mode as any,
      status: status as any,
      publish_at: publish_at || null,
      unpublish_at: computedUnpublishAt || null,
      waiver_text: waiver_text || null,
    })
    .eq('id', id);
  revalidatePath(`/programs/${id}`);
  revalidatePath('/programs');
  // Ensure the form reflects updates immediately after POST
  redirect(`/programs/${id}`);
}

export default async function ProgramDetailPage({ params }: { params: { id: string } }) {
  const supabase = await serverClient();
  const admin = await isStaff();
  const { data: program } = await supabase
    .from('programs')
    .select('*')
    .eq('id', params.id)
    .single();

  if (!program) return <p className="text-center mt-10">Program not found</p>;

  // Compute participation counts via RPC (security definer)
  const { data: part } = await supabase.rpc('program_participation', { p_program_ids: [params.id] });
  const regCount = Array.isArray(part) && part.length > 0 ? (part[0] as any).registered ?? 0 : 0;
  const isFull = (program.capacity ?? 0) > 0 ? regCount >= (program.capacity ?? 0) : false;

  return (
    <div className="flex flex-col items-center mt-6 min-h-screen p-6">
      <div className="max-w-xl w-full bg-white shadow-lg rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">{program.title}</h1>
          {admin && (
            <Link href={`/programs/${params.id}/checkin`} className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded">Check-in</Link>
          )}
        </div>

        {admin ? (
          <form action={saveProgram.bind(null, params.id)} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Title</label>
              <input name="title" defaultValue={program.title || ''} className="w-full border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Description</label>
              <textarea name="description" defaultValue={program.description || ''} className="w-full border rounded px-2 py-1" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Location</label>
                <input name="location" defaultValue={program.location || ''} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Capacity</label>
                <input type="number" min={0} name="capacity" defaultValue={program.capacity || 0} className="w-full border rounded px-2 py-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Start</label>
                <input type="datetime-local" name="start_at" defaultValue={program.start_at ? new Date(program.start_at).toISOString().slice(0,16) : ''} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">End</label>
                <input type="datetime-local" name="end_at" defaultValue={program.end_at ? new Date(program.end_at).toISOString().slice(0,16) : ''} className="w-full border rounded px-2 py-1" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Visibility</label>
                <select name="visibility" defaultValue={program.visibility || 'PUBLIC'} className="w-full border rounded px-2 py-1">
                  <option value="PUBLIC">PUBLIC</option>
                  <option value="STUDENTS_ONLY">STUDENTS_ONLY</option>
                  <option value="MEMBERS_ONLY">MEMBERS_ONLY</option>
                  <option value="INTERNAL">INTERNAL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Delivery Mode</label>
                <select name="delivery_mode" defaultValue={program.delivery_mode || 'IN_PERSON'} className="w-full border rounded px-2 py-1">
                  <option value="IN_PERSON">IN_PERSON</option>
                  <option value="ONLINE">ONLINE</option>
                  <option value="HYBRID">HYBRID</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Status</label>
                <select name="status" defaultValue={program.status || 'SCHEDULED'} className="w-full border rounded px-2 py-1">
                  <option value="SCHEDULED">SCHEDULED</option>
                  <option value="CANCELED">CANCELED</option>
                  <option value="COMPLETED">COMPLETED</option>
                </select>
              </div>
            </div>
            {/* Price fields removed as schema no longer includes these columns */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Publish At</label>
                <input type="datetime-local" name="publish_at" defaultValue={program.publish_at ? new Date(program.publish_at).toISOString().slice(0,16) : ''} className="w-full border rounded px-2 py-1" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Unpublish At</label>
                <input type="datetime-local" name="unpublish_at" defaultValue={program.unpublish_at ? new Date(program.unpublish_at).toISOString().slice(0,16) : ''} className="w-full border rounded px-2 py-1" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Waiver Text</label>
              <textarea name="waiver_text" defaultValue={program.waiver_text || ''} className="w-full border rounded px-2 py-1" />
            </div>
            <button type="submit" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors">Save</button>
          </form>
        ) : (
          <>
            {/* Capacity / status summary */}
            <div className="mb-4 text-sm text-gray-700">
              {program.capacity > 0 ? (
                <>
                  <div>
                    <strong>Capacity:</strong> {regCount}/{program.capacity}
                  </div>
                  {isFull && (
                    <div className="text-amber-700">This program is currently full. You can join the waitlist.</div>
                  )}
                </>
              ) : (
                <div><strong>Capacity:</strong> Unlimited</div>
              )}
            </div>
            <ProgramRegisterClient program={{ ...program, _isFull: isFull, _regCount: regCount }} />
          </>
        )}
      </div>
    </div>
  );
}
