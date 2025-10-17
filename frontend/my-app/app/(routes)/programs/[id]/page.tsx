// app/programs/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { updateProgramAction } from "./actions";
import { toDatetimeLocalValue, fromDatetimeLocalValue } from "@/lib/datetime";

export default function ProgramDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [program, setProgram] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [regCount, setRegCount] = useState<number>(0);
  const [isFull, setIsFull] = useState<boolean>(false);
  const [hasParticipation, setHasParticipation] = useState<boolean>(true);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [editing, setEditing] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [form, setForm] = useState<any | null>(null);

  // Fetch program data from Supabase
  useEffect(() => {
    const fetchProgram = async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setError("Failed to load program.");
      } else {
        setProgram(data);
      }

      setLoading(false);
    };

    fetchProgram();
  }, [id, supabase]);

  // Fetch participation counts via RPC (security definer)
  useEffect(() => {
    const fetchParticipation = async () => {
      if (!id) return;
      try {
        // Prefer security-definer RPC for accurate counts regardless of RLS
        let part: any[] | null = null;
        let rpcErr: any = null;
        {
          const res = await supabase.rpc('program_participation', { p_program_ids: [id] as any });
          part = Array.isArray(res.data) ? res.data as any[] : null;
          rpcErr = res.error;
        }
        if (!part || rpcErr) {
          const res2 = await supabase.rpc('program_participation', { p_program_ids: null as any });
          part = Array.isArray(res2.data) ? res2.data as any[] : null;
          rpcErr = res2.error;
        }
        if (!part || rpcErr) throw rpcErr || new Error('participation rpc failed');
        const row = part.find((r: any) => r.program_id === id);
        const count = row?.registered ?? 0;
        setRegCount(count);
        setHasParticipation(true);
      } catch (e: any) {
        // Fallback: if staff, we can count via table (RLS permits staff). For non-staff, hide counts to avoid misleading values.
        try {
          if (isStaff) {
            const { count, error: cErr } = await supabase
              .from('registrations')
              .select('id', { count: 'exact', head: true })
              .eq('program_id', id)
              .in('status', ['REGISTERED','CHECKED_IN']);
            if (!cErr && typeof count === 'number') {
              setHasParticipation(true);
              setRegCount(count);
              return;
            }
          }
        } catch {}
        setHasParticipation(false);
        setRegCount(0);
      }
    };
    fetchParticipation();
  }, [id, supabase, isStaff]);

  // Check if current user is registered for this program
  useEffect(() => {
    const checkRegistered = async () => {
      try {
        const { data: userRes } = await supabase.auth.getUser();
        const user = userRes?.user;
        if (!user) {
          setIsRegistered(false);
          return;
        }
        const { data, error } = await supabase
          .from('registrations')
          .select('status')
          .eq('program_id', id)
          .eq('user_id', user.id)
          .not('status','eq','CANCELED')
          .limit(1);
        if (!error && data && data.length > 0) setIsRegistered(true);
        else setIsRegistered(false);
      } catch (e) {
        // Non-fatal
      }
    };
    checkRegistered();
  }, [id, supabase, editing]);

  // Compute fullness whenever program or regCount changes
  useEffect(() => {
    if (!program) return;
    const cap = program.capacity ?? 0;
    const full = hasParticipation && cap > 0 ? regCount >= cap : false;
    setIsFull(full);
    setForm(program);
  }, [program, regCount, hasParticipation]);

  // Check if current user is staff/admin
  useEffect(() => {
    const fetchIsStaff = async () => {
      try {
        const { data, error } = await supabase.rpc('auth_is_staff');
        if (error) return;
        setIsStaff(Boolean(data));
      } catch {}
    };
    fetchIsStaff();
  }, [supabase]);

  const refreshCounts = async () => {
    try {
      let part: any[] | null = null;
      let rpcErr: any = null;
      {
        const res = await supabase.rpc('program_participation', { p_program_ids: [id] as any });
        part = Array.isArray(res.data) ? res.data as any[] : null;
        rpcErr = res.error;
      }
      if (!part || rpcErr) {
        const res2 = await supabase.rpc('program_participation', { p_program_ids: null as any });
        part = Array.isArray(res2.data) ? res2.data as any[] : null;
        rpcErr = res2.error;
      }
      if (!part || rpcErr) throw rpcErr || new Error('participation rpc failed');
      const row = part.find((r: any) => r.program_id === id);
      setHasParticipation(true);
      setRegCount(row?.registered ?? 0);
    } catch {
      // Fallback to direct count only for staff
      try {
        if (isStaff) {
          const { count, error: cErr } = await supabase
            .from('registrations')
            .select('id', { count: 'exact', head: true })
            .eq('program_id', id)
            .in('status', ['REGISTERED','CHECKED_IN']);
          if (!cErr && typeof count === 'number') {
            setHasParticipation(true);
            setRegCount(count);
            return;
          }
        }
        setHasParticipation(false);
      } catch {
        setHasParticipation(false);
      }
    }
  };

  const handleRegister = async () => {
    if (isRegistered) {
      // Unregister via API
      try {
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ programId: id, action: 'cancel' }),
        });
        const json = await res.json();
        if (!res.ok || !json.success) {
          setError(json.message || 'Failed to cancel');
          return;
        }
        setIsRegistered(false);
        refreshCounts();
      } catch (e:any) {
        setError(e?.message ?? 'Failed to cancel');
      }
    } else {
      // Go to waiver first
      router.push(`/programs/${id}/waiver`);
    }
  };

  // After waiver, navigation remounts this page; effects above will refresh state.

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!program) return <p className="text-center mt-10">Program not found</p>;
  
  const capLabel = hasParticipation
    ? (program?.capacity ? `${regCount}/${program.capacity}` : `${regCount}`)
    : '—';

  return (
    <div className="flex flex-col items-center mt-6 min-h-screen p-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6">
        <div className="mb-3">
          <button
            onClick={() => router.push('/programs')}
            className="text-blue-600 hover:underline text-sm"
          >
            ← Back to Programs
          </button>
        </div>
        {!editing && (
          <>
            <h1 className="text-2xl font-bold mb-3 text-center">{program.title}</h1>
            <p className="text-gray-700 mb-3">{program.description}</p>
            <p className="text-sm text-gray-500 mb-1">
              <strong>Location:</strong> {program.location}
            </p>

            <p className="text-sm text-gray-500 mb-4">
              <strong>Time:</strong>{" "}
              {new Date(program.start_at).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}{" "}
              -{" "}
              {new Date(program.end_at).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </>
        )}

        {editing && isStaff && form && (
          <div className="space-y-3 mb-4">
            <input className="w-full border rounded px-3 py-2" value={form.title ?? ''} onChange={e=>setForm((f:any)=>({...f, title:e.target.value}))} placeholder="Title" />
            <textarea className="w-full border rounded px-3 py-2" value={form.description ?? ''} onChange={e=>setForm((f:any)=>({...f, description:e.target.value}))} placeholder="Description" />
            <input className="w-full border rounded px-3 py-2" value={form.location ?? ''} onChange={e=>setForm((f:any)=>({...f, location:e.target.value}))} placeholder="Location" />
            <div>
              <label className="block text-sm font-medium mb-1">Visibility</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={form.visibility ?? 'PUBLIC'}
                onChange={e=>setForm((f:any)=>({...f, visibility:e.target.value}))}
              >
                <option value="PUBLIC">PUBLIC</option>
                <option value="MEMBERS_ONLY">MEMBERS_ONLY</option>
                <option value="STUDENTS_ONLY">STUDENTS_ONLY</option>
                <option value="INTERNAL">INTERNAL</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" min={0} className="w-full border rounded px-3 py-2" value={form.capacity ?? 0} onChange={e=>setForm((f:any)=>({...f, capacity:Number(e.target.value)}))} placeholder="Capacity" />
            </div>
            <input
              type="datetime-local"
              className="w-full border rounded px-3 py-2"
              value={toDatetimeLocalValue(form.start_at)}
              onChange={e=>setForm((f:any)=>({...f, start_at: fromDatetimeLocalValue(e.target.value)}))}
            />
            <input
              type="datetime-local"
              className="w-full border rounded px-3 py-2"
              value={toDatetimeLocalValue(form.end_at)}
              onChange={e=>setForm((f:any)=>({...f, end_at: fromDatetimeLocalValue(e.target.value)}))}
            />
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium mb-1">Publish at</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded px-3 py-2"
                  value={toDatetimeLocalValue(form.publish_at)}
                  onChange={e=>setForm((f:any)=>({...f, publish_at: fromDatetimeLocalValue(e.target.value)}))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Unpublish at</label>
                <input
                  type="datetime-local"
                  className="w-full border rounded px-3 py-2"
                  value={toDatetimeLocalValue(form.unpublish_at)}
                  onChange={e=>setForm((f:any)=>({...f, unpublish_at: fromDatetimeLocalValue(e.target.value)}))}
                />
              </div>
            </div>
            {/* waiver_url removed from schema */}
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isFull ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}>
            {isFull ? "Full" : "Open"}
          </span>
          <span className="text-xs text-gray-600">Registered: {capLabel}</span>
        </div>

        {!editing && (
          <button
            onClick={handleRegister}
            className={`w-full py-2 rounded-lg font-semibold transition ${
              isRegistered
                ? "bg-red-500 text-white hover:bg-red-600"
                : isFull
                  ? "bg-teal-600 text-white hover:bg-teal-700"
                  : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {isRegistered ? "Unregister" : isFull ? "Join waitlist" : "Register"}
          </button>
        )}

        {isStaff && !editing && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => router.push(`/programs/${id}/check-in`)}
              className="w-full py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Check In Page
            </button>
            <button
              onClick={() => setEditing(true)}
              className="w-full py-2 rounded-lg font-semibold bg-teal-600 text-white hover:bg-teal-700 transition"
            >
              Edit Program
            </button>
          </div>
        )}

        {isStaff && editing && (
          <form
            action={async (fd: FormData) => {
              setSaving(true);
              setError(null);
              fd.set("id", String(id));
              fd.set("title", form?.title ?? "");
              fd.set("description", form?.description ?? "");
              fd.set("location", form?.location ?? "");
              fd.set("visibility", form?.visibility ?? "PUBLIC");
              fd.set("capacity", String(form?.capacity ?? 0));
              if (form?.start_at) fd.set("start_at", form.start_at);
              if (form?.end_at) fd.set("end_at", form.end_at);
              if (form?.publish_at) fd.set("publish_at", form.publish_at);
              if (form?.unpublish_at) fd.set("unpublish_at", form.unpublish_at);

              const res = await updateProgramAction(fd);
              if (!res.ok) {
                setError(res.error ?? 'Failed to save program');
                setSaving(false);
                return;
              }
              // Update local program state so the UI reflects new values immediately
              if (res.program) {
                setProgram(res.program);
                setForm(res.program);
              }
              setSaving(false);
              setEditing(false);
            }}
            className="mt-3 grid grid-cols-2 gap-2"
          >
            <button
              type="submit"
              disabled={saving}
              className={`w-full py-2 rounded-lg font-semibold ${saving ? 'bg-green-300' : 'bg-green-600 hover:bg-green-700'} text-white transition`}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button
              type="button"
              onClick={() => { setEditing(false); setForm(program); }}
              disabled={saving}
              className="w-full py-2 rounded-lg font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
            >
              Cancel
            </button>
          </form>
        )}

        {error && (
          <p className="mt-3 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
}
