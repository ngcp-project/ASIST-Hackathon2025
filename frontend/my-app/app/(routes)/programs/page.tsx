// app/(routes)/programs/page.tsx
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {ChevronDown} from "lucide-react";

export default async function ProgramsPage() {
  const supabase = createClient();

  const { data: programs, error } = await supabase.from("programs").select("*");
  console.log(programs)

  if (error) {
    console.error("Error fetching programs:", error);
    return <p className="text-red-500">Failed to load programs.</p>;
  }

  return (
    
    <div className="min-h-screen flex flex-col">

      <main className="flex flex-col items-center px-6 py-8 w-full">
        {/*Title*/}
        <div className="bg-gray-300 w-full max-w-4xl h-32 flex items-center justify-center text-xl font-semibold text-black rounded-md">
          Upcoming Activities
        </div>

        {/*Filter*/}
        <div className="w-full max-w-4xl flex justify-end mt-4">
          <button
            className="flex items-center gap-1 border border-gray-400 rounded-md px-3 py-1.5 text-sm font-medium text-black bg-white hover:bg-gray-100 transition"
          >
            Filter
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        {/*Program grid*/}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-6 max-w-4xl w-">
          {programs?.map((program) => (
            <Link
            key={program.id}
            href={`/programs/${program.id}`}
            className="p-6 border rounded-lg shadow hover:shadow-lg transition bg-white"
          >
            <h2 className="text-xl font-semibold">{program.title}</h2>
            <p className="text-sm mt-3 text-gray-500">
              📍 {program.location}
            </p>

            <p className="text-sm text-gray-500 mb-4">
              <strong>Time:</strong>{" "}
              {new Date(program.start_at).toLocaleString("en-US", {
              dateStyle: "medium", timeStyle: "short",})}{" "}-{" "}
              {new Date(program.end_at).toLocaleString("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
            
          </Link>
        ))}
      </div>
      </main>
    </div>
  );
}
