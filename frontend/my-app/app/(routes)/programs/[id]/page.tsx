// app/programs/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProgramDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();

  const [program, setProgram] = useState<any>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setMessage(null);
    // fetch program
    const { data: prog, error: pErr } = await supabase
      .from("programs")
      .select("*")
      .eq("id", String(id))
      .single();
    if (pErr) {
      console.error(pErr);
      setProgram(null);
    } else {
      setProgram(prog);
    }
    // check if current user has a non-canceled registration
    const { data: userRes } = await supabase.auth.getUser();
    if (userRes.user) {
      const { data: regs, error: rErr } = await supabase
        .from('registrations')
        .select('id,status')
        .eq('program_id', String(id))
        .eq('user_id', userRes.user.id)
        .in('status', ['REGISTERED','WAITLISTED','CHECKED_IN'])
        .limit(1);
      if (!rErr && regs && regs.length > 0) setIsRegistered(true);
      else setIsRegistered(false);
    } else {
      setIsRegistered(false);
    }

    //check if current user is an admin
    if(userRes.user){
      const {data: role, error} = await supabase
        .from('users')
        .select('affiliation')
        .eq('id', userRes.user.id)
      if (error) {
        console.error("Error fetching user's role:", error);
      }

      if (role && (role[0]?.affiliation == 'Faculty and Staff')) {
        setIsAdmin(true)
      }
    }

    setLoading(false);
  }, [id, supabase]);

  const handleRegister = () => {
    if (isRegistered) {
      // Unregister
      localStorage.removeItem(`registered_${id}`);
      setIsRegistered(false);
    } else {
      // Go to waiver first
      router.push(`/programs/${id}/waiver`);
    }
  };

  // After waiver, the page can re-check localStorage (see below)
  useEffect(() => {
    const stored = localStorage.getItem(`registered_${id}`);
    if (stored === "true") setIsRegistered(true);
  }, [id]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!program) return <p className="text-center mt-10">Program not found</p>;

  return (
    <div className="flex flex-col items-center mt-6 min-h-screen p-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6">
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

        <button
          onClick={handleRegister}
          className={`w-full py-2 rounded-lg font-semibold transition ${
            isRegistered
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {isRegistered ? "Unregister" : "Register"}
        </button>
        {message && <p className="mt-3 text-sm text-red-600">{message}</p>}

        {isAdmin && (
          <button
            onClick={() => router.push(`/programs/${id}/check-in`)}
            className={`mt-4 w-full py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300`}
              >
            Check In Page
          </button>
        )}
      
      </div>
    </div>
  );
}
