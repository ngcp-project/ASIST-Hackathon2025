"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export default function Programs() {
  //mock data
  const mockPrograms = [
    { id: 1, name: "Fitness Program" },
    { id: 2, name: "Student Union" },
    { id: 3, name: "Recreation Center" },
    { id: 4, name: "Events & Activities" },
  ];

  return (
    <div className="min-h-screen flex flex-col">

      <main className="flex flex-col items-center px-6 py-8 w-full">
        {/*Title*/}
        <div className="bg-gray-300 w-full max-w-4xl h-32 flex items-center justify-center text-xl font-semibold text-black rounded-md">
          ASICPP
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 mt-6 max-w-4xl w-full">
          {mockPrograms.map((program) => (
            <Link
              key={program.id}
              href={`/programs/${program.id}`}
              className="bg-gray-300 aspect-square flex items-center justify-center text-sm font-medium text-black rounded-md hover:bg-gray-400 transition cursor-pointer"
            >
              {program.name}
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}
