"use client";

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function RegistrationForm({ programId, programTitle }: { programId: string; programTitle?: string }) {
  const router = useRouter();
  const [affiliation, setAffiliation] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [waiver, setWaiver] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      if (data.user) {
        // fetch profile affiliation if present
        supabase.from('users').select('affiliation').eq('id', data.user.id).maybeSingle().then(({ data }) => {
          if (!mounted) return;
          setAffiliation(data?.affiliation ?? null);
        });
      }
    });
    return () => { mounted = false };
  }, []);

  // simple per-affiliation extra question examples
  const extraQuestionsFor = (aff?: string | null) => {
    if (aff === 'Student') return [{ key: 'student_id', label: 'Student ID' }];
    if (aff === 'Faculty and Staff') return [{ key: 'department', label: 'Department' }];
    return [{ key: 'phone', label: 'Phone Number' }];
  };

  const handleChange = (k: string, v: any) => setAnswers(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!waiver) {
      setMessage('Please accept the waiver');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ programId, answers })
      });
      const data = await res.json();
      if (!data.success) {
        setMessage(data.message || 'Failed to register');
      } else {
        setMessage(`Registered: ${data.status}`);
        // small delay then navigate
        setTimeout(() => {
          router.push('/profile');
        }, 900);
      }
    } catch (err: any) {
      setMessage(err?.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl w-full bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-2">Register for {programTitle ?? programId}</h2>
      <p className="text-sm text-gray-600 mb-4">Please complete the form below to register for this program.</p>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Affiliation</label>
        <div className="px-3 py-2 border rounded bg-gray-50">{affiliation ?? 'Not specified'}</div>
      </div>

      {extraQuestionsFor(affiliation).map(q => (
        <div key={q.key} className="mb-3">
          <label className="block text-sm font-medium mb-1">{q.label}</label>
          <input className="w-full px-3 py-2 border rounded" onChange={e => handleChange(q.key, e.target.value)} />
        </div>
      ))}

      <div className="mb-4">
        <label className="inline-flex items-center">
          <input type="checkbox" checked={waiver} onChange={e => setWaiver(e.target.checked)} className="mr-2" />
          <span className="text-sm text-gray-700">I have read and agree to the waiver</span>
        </label>
      </div>

      <div className="flex gap-3 items-center">
        <button onClick={handleSubmit} disabled={loading} className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50">{loading ? 'Registering…' : 'Register'}</button>
        <button onClick={() => router.back()} className="px-4 py-2 border rounded">Cancel</button>
        {message && <div className="text-sm text-gray-700 ml-3">{message}</div>}
      </div>
    </div>
  );
}
