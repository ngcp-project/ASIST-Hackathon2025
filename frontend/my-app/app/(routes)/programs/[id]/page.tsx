import React from "react";
import Link from "next/link";
import { getProgramById } from "@/lib/mockData/programs";

interface ProgramPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProgramDetailPage({ params }: ProgramPageProps) {
  const { id } = await params;
  const program = await getProgramById(id);

  if (!program) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex flex-col items-center justify-center h-full text-gray-700">
          <h1 className="text-2xl font-semibold mb-4">Program not found</h1>
          <p>Requested program (ID: {id}) does not exist.</p>
        </main>
      </div>
    );
  }

  const formatTime = (time: string) =>
    new Date(time).toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex flex-col items-center px-6 py-12">
        <div className="bg-gray-100 w-full max-w-3xl p-8 rounded-md shadow text-left">
          <h1 className="text-3xl font-bold mb-3 text-gray-900">
            {program.title}
          </h1>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {program.description}
          </p>

          <div className="border-t border-gray-300 pt-4 space-y-2 text-gray-800">
            <p>
              <strong>Location:</strong> {program.location}
            </p>
            <p>
              <strong>Starts:</strong> {formatTime(program.startTime)}
            </p>
            <p>
              <strong>Ends:</strong> {formatTime(program.endTime)}
            </p>
          </div>

          {/*Register Button */}
          <div className="mt-8 flex justify-center">
            <Link
              href={`/programs/${program.id}/waiver`}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Register
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
