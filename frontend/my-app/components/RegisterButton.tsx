"use client";

import { useState } from 'react';

export default function RegisterButton({ programId }: { programId: string }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handle = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId })
      });
      const data = await res.json();
      if (!data.success) setMessage(data.message || 'Failed');
      else {
        const status = data.status || (data.data?.status);
        if (status === 'WAITLISTED') {
          const pos = data.data?.waitlist_position;
          setMessage(typeof pos === 'number' ? `Waitlisted (position ${pos})` : 'Waitlisted');
        } else {
          setMessage(`Registered: ${status}`);
        }
      }
    } catch (err: any) {
      setMessage(err?.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <button onClick={handle} disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
        {loading ? 'Processing…' : 'Register'}
      </button>
      {message && <p className="mt-2 text-sm text-gray-700">{message}</p>}
    </div>
  );
}
