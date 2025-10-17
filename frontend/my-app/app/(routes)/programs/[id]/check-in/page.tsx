// app/programs/[id]/waiver/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { resolve } from "path";

export default function CheckInPage() {
  const router = useRouter();
  const { id } = useParams();

  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState<any[]>();
  const [program, setProgram] = useState<String>();
  const [userID, setUser] = useState<String>();
  const [isAdmin, setIsAdmin] = useState(false);

  //check if current user is an admin

  const fetchUserRole = async () => {
    const { data: userRes } = await supabase.auth.getUser();

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

    await new Promise((resolve) => setTimeout(resolve, 1000));
    setLoading(false)
  }

  // Fetch registration data from Supabase
  const fetchRegistered = async () => {

    const { data: userRes} = await supabase.auth.getUser()
    if (!userRes?.user) return;

    setUser(userRes.user.id)

    const { data: registrations, error } = await supabase
      .from("registrations")
      .select(`
        id, 
        program_id, 
        status,
        checked_in_at, 
        users!fk_regs_user(
          first_name,
          last_name,
          email)`) //add to query to find name of user connected to the fk of the registration 
      .eq('program_id', id);

    if (error) {
      console.error("Error fetching registrations:", error);
      return <p className="text-red-500">Failed to load registrations.</p>;
    } else {
      setRegistrations(registrations)
      const fetchTitle = async () => {
        const { data: program, error } = await supabase
          .from("programs")
          .select('title')
          .eq('id', id);
        if (error) {
        console.error("Error fetching registrations:", error);
        } else {
          setProgram(program[0].title)
        }
      }
      fetchTitle()
    }
  };

  useEffect(() => {
    fetchUserRole();
    fetchRegistered();
  },[supabase]);

  function Status({ id, status, checked_in_at }: { id: any, status: string, checked_in_at: any }) {
    const state = getState(status)
    const [buttonText, setButtonText] = useState(state?.text);
    const [buttonStyle, setStyle] = useState(state?.style);
    const [checkIn, setCheckIn] = useState(checked_in_at);

    const handleClick = async () => {
      //adds it to check in data base and updates the status
      handleCheckIn(id, status)
      //fetch new status 
      const { data: newStatus, error } = await supabase
        .from("registrations")
        .select('status, checked_in_at') //add to query to find name of user connected to the fk of the registration 
        .eq('id', id);

      if (error) {
        console.error("Error fetching status:", error);
        return;
      }

      const state = getState(newStatus[0]?.status)
      setButtonText(state?.text)
      setStyle(state?.style)
      setCheckIn(newStatus[0]?.checked_in_at)
      fetchRegistered()
    };

    return (
      <div className="w-full flex items-left">
        <div className="w-1/2 flex flex-row items-center text-wrap">
                {checkIn ? new Date(checkIn).toLocaleString() : '-'}
        </div>
        <button className={buttonStyle} onClick={handleClick}>{buttonText}</button>
      </div>
    );
  }

  const getState = (status: any) => {
    switch (status) {
    case "REGISTERED":
      return{
        text: "Check In",
        style:"w-1/2 py-2 rounded-lg transition font-semibold flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
      }
    case "WAITLISTED":
      return{
        text: "Waitlisted",
        style:"w-1/2 py-2 rounded-lg transition"
      }
    case "CANCELED":
      return{
        text: "Canceled",
        style:"w-1/2 py-2 rounded-lg transition text-red-600"
      }
    case "CHECKED_IN":
      return{
        text: "Checked In",
        style:"w-1/2 py-2 rounded-lg transition font-semibold flex-1 bg-gray-400 text-white py-2 rounded-lg"
      }
    }
  }

  const handleCheckIn = async (registrationID: any, status:any) => {
    //add check in to check in database
    if(status == 'REGISTERED') {
      await supabase
      .from('registrations')
      .update({
        status: 'CHECKED_IN',
        checked_in_at: new Date().toISOString(),
        checked_in_by_user_id: userID,
      })
      .eq('id', registrationID)
    } else if (status == 'CHECKED_IN') {
      // Revert to REGISTERED 
      await supabase
        .from('registrations')
        .update({
          status: 'REGISTERED',
          checked_in_at: null,
          checked_in_by_user_id: null,
        })
        .eq('id', registrationID)
    }
  };

  /*No registrations*/
  if (registrations?.length==0) return (
    <div className="flex flex-col items-center min-h-screen p-6">

      {loading && (
      <h1 className="text-2xl font-bold mb-4">{program} Loading...</h1>
      )}

      {!loading && (
      <h1 className="text-2xl font-bold mb-4">{program} Check In</h1>
      )}

      <div className="min-w-lg flex gap-4 flex-col text-center">
        <div className="w-full bg-white shadow-lg rounded-2xl p-6 text-center flex gap-4 flex-col">
          {isAdmin? "No Registrations":"You do not have permissions to view this."}
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

      {loading && (
      <h1 className="text-2xl font-bold mb-4">{program} Loading...</h1>
      )}
      
      {!loading && (
      <h1 className="text-2xl font-bold mb-4">{program} Check In</h1>
      )}

      {!loading && !isAdmin && (
        <div className="min-w-lg flex gap-4 flex-col text-center">
          <div className="w-full bg-white shadow-lg rounded-2xl p-6 text-center flex gap-4 flex-col">
            You do not have permissions to view this.
            <button
              onClick={() => router.push(`/programs/${id}`)}
              className={"w-full py-2 rounded-lg font-semibold bg-blue-600 text-white hover:bg-blue-700"}
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/*Registration List*/}
      {!loading && isAdmin && (
        <div className="min-w-3xl flex gap-4 flex-col">

          {registrations?.map((registration) => (
            <div key={registration.id} className="w-full bg-white shadow-lg rounded-2xl p-6 text-center">
              <div className="flex gap-4">
                <div className="w-2/5 flex flex-col items-left">
                  <h2 className="text-xl font-semibold text-wrap text-left">{registration.users.first_name} {registration.users.last_name}</h2>
                  <h3 className="text-wrap text-left">{registration.users.email}</h3>
                </div>

                <Status 
                key={registration.id}
                id={registration.id} 
                status={registration.status} 
                checked_in_at={registration.checked_in_at}
                />

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
      )}
    </div>
  );
}

