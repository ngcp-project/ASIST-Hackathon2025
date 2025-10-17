"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function ProgramRegisterClient({ program }: { program: any }) {
  const supabase = createClient();
  const router = useRouter();
  const [isRegistered, setIsRegistered] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const load = useCallback(async () => {
    const { data: userRes } = await supabase.auth.getUser();
    if (userRes?.user) {
      const { data: regs } = await supabase
        .from('registrations')
        .select('id,status')
        .eq('program_id', program.id)
        .eq('user_id', userRes.user.id)
        .in('status', ['REGISTERED','WAITLISTED','CHECKED_IN'])
        .limit(1);
      setIsRegistered(!!(regs && regs.length > 0));
    } else {
      setIsRegistered(false);
    }
  }, [program.id, supabase]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setMounted(true); }, []);

  const handleClick = async () => {
    if (!program) return;
    if (isRegistered) {
      try {
        setBusy(true);
        setMessage(null);
        const res = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ programId: String(program.id), action: 'cancel' })
        });
        const data = await res.json();
        if (!data.success) setMessage(data.message || 'Failed to cancel');
        await load();
      } finally {
        setBusy(false);
      }
    } else {
      router.push(`/programs/${program.id}/waiver`);
    }
  };

  return (
    <div>
      <p className="text-gray-700 mb-3">{program.description}</p>
      <p className="text-sm text-gray-500 mb-1">
        <strong>Location:</strong> {program.location}
      </p>
      <p className="text-sm text-gray-500 mb-4">
        <strong>Time:</strong>{" "}
        {mounted
          ? new Date(program.start_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
          : new Date(program.start_at).toISOString()}
        {" "}-{" "}
        {mounted
          ? new Date(program.end_at).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })
          : new Date(program.end_at).toISOString()}
      </p>
      <button
        onClick={handleClick}
        disabled={busy}
        className={`w-full py-2 rounded-lg font-semibold transition ${
          isRegistered
            ? "bg-red-500 text-white hover:bg-red-600 disabled:bg-red-300"
            : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
        }`}
      >
        {isRegistered ? (busy ? 'Unregistering…' : 'Unregister') : 'Register'}
      </button>
      {message && <p className="mt-3 text-sm text-red-600">{message}</p>}
    </div>
  );
}
