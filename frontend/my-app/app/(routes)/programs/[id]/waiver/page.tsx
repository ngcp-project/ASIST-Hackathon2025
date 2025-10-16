// app/programs/[id]/waiver/page.tsx
"use client";

import { useRouter, useParams } from "next/navigation";

export default function WaiverPage() {
  const router = useRouter();
  const { id } = useParams();

  const handleAgree = () => {
    localStorage.setItem(`registered_${id}`, "true");
    router.push(`/programs/${id}`);
  };

  const handleCancel = () => {
    router.push(`/programs/${id}`);
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-6">
      <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Program Waiver</h1>
        <div className="text-gray-700 space-y-4 items-center mb-6">
        <p>By accepting this waiver, you agree to the following terms and conditions:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>You understand that membership in this organization comes with certain responsibilities and expectations.</li>
          <li>You agree to abide by all rules, regulations, and policies set forth by the organization.</li>
          <li>You acknowledge that the organization is not liable for any personal injury, property damage, or other losses that may occur during organization events or activities.</li>
          <li>You agree to conduct yourself in a professional and respectful manner at all times when representing the organization.</li>
          <li> You understand that membership fees are non-refundable once processed.</li>
        </ul>
        <p className="font-semibold"> Please read this waiver carefully before agreeing to the terms.</p>
      </div>

        <div className="flex gap-4">
          <button
            onClick={handleAgree}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
          >
            Agree and Continue
          </button>
          <button
            onClick={handleCancel}
            className="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

