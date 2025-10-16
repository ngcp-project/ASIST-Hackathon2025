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

  // Fetch program data from Supabase
  useEffect(() => {
    const fetchProgram = async () => {
      const { data, error } = await supabase
        .from("programs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) console.error(error);
      else {
        setProgram(data);
      }

      // Check local storage for registration state
      const stored = localStorage.getItem(`registered_${id}`);
      if (stored === "true") setIsRegistered(true);

      setLoading(false);
    };

    fetchProgram();
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
      </div>
    </div>
  );
}
