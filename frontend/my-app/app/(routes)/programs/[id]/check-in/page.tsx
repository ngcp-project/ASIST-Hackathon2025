// app/programs/[id]/waiver/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function CheckInPage() {
  const router = useRouter();
  const { id } = useParams();

  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>();

  // Fetch registration data from Supabase
  useEffect(() => {
    const fetchRegistered = async () => {

      const { data: registrations, error } = await supabase
        .from("registrations")
        .select() //add to query to find name of user connected to the fk of the registration 
        ;

      console.log(registrations)

      if (error) {
        console.error("Error fetching registrations:", error);
        return <p className="text-red-500">Failed to load registrations.</p>;
      } else {
        setRegistrations(registrations)
      }

      setLoading(false);
    };

    fetchRegistered();
  },[supabase]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  const handleCheckIn = (registration: any) => {
    //update check in status
    //add check in to check in database
  };

  /*No registrations*/
  if (registrations?.length==0) return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Program Check In</h1>

      <div className="min-w-lg flex gap-4 flex-col text-center">
        <div className="w-full bg-white shadow-lg rounded-2xl p-6 text-center flex gap-4 flex-col">
          No Registrations
          <button
            onClick={() => router.push(`/programs/${id}`)}
            className={"w-full py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700"}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );

  /*Has Registrations*/
  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">Program Check In</h1>

      {/*Registration List*/}
      <div className="min-w-lg flex gap-4 flex-col">

        {registrations?.map((registration) => (
          <div key={registration.id} className="w-full bg-white shadow-lg rounded-2xl p-6 text-center">
            <div className="flex gap-4">
              <div className="w-2/3 text-xl font-semibold text-wrap text-left flex flex-row items-center">
                {/**insert name of the person who is registered here */}
              </div>
              <button
                onClick={() => handleCheckIn(registration)}

                className={`w-1/3 py-2 rounded-lg font-semibold transition ${
                registration.status == 'CHECKED_IN'
                  ? "flex-1 bg-gray-400 text-white py-2 rounded-lg"
                  : "flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                }`}
              >
                {registration.status == 'CHECKED_IN' ? "Checked In" : "Check In"}
              </button>
            </div>
          </div>
        ))}

        <button
          onClick={() => router.push(`/programs/${id}`)}
          className={"w-full py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700"}
        >
          Back
        </button>

      </div>
    </div>
  );
}

