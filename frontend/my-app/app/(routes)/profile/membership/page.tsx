"use client";

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Membership() {
  const router = useRouter();
  const [affiliation, setAffiliation] = useState('');
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState('');
  const [waiver, setWaiver] = useState(false);
  const [showWaiverModal, setShowWaiverModal] = useState(false);
  const [hasViewedWaiver, setHasViewedWaiver] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!mounted) return;
      const user = data.user;
      if (!user) {
        // redirect to sign-in if not authenticated
        router.replace('/sign-in');
        return;
      }

      const { data: profile } = await supabase
        .from('users')
        .select('affiliation')
        .eq('id', user.id)
        .maybeSingle();

      if (profile) setAffiliation(profile.affiliation ?? '');
    }).catch(() => {
      router.replace('/sign-in');
    });

    return () => { mounted = false; };
  }, [router]);

  // Update price when duration or affiliation changes
  useEffect(() => {
    if (affiliation === 'Student') {
      setPrice(0);
    } else if (affiliation === 'Alumni' || affiliation === 'Faculty and Staff') {
      if (duration === 'Semester') {
        setPrice(241);
      } else if (duration === 'Full Year') {
        setPrice(482);
      } else {
        setPrice(0); // No duration selected yet
      }
    }
  }, [affiliation, duration]);

  const handleRegister = async () => {
    // Calculate start and expiration dates
    const startDate = new Date();
    const expireDate = new Date();

    if (duration === 'Semester') {
      // Add 4 months for a semester
      expireDate.setMonth(expireDate.getMonth() + 4);
    } else if (duration === 'Full Year') {
      // Add 1 year
      expireDate.setFullYear(expireDate.getFullYear() + 1);
    }

    // Format dates as MM/DD/YYYY
    const formatDate = (date: Date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };

    // Record membership purchase as a transaction (canonical)
    const supabase = createClient();
    try {
      const { data: session } = await supabase.auth.getUser();
      const user = session?.user;
      if (!user) {
        router.replace('/sign-in');
        return;
      }

      // Pick a plan based on duration
      const planName = duration === 'Full Year' ? 'Annual Member (12 mo)' : 'Fall 2025 Semester Pass';
      const { data: plan } = await supabase
        .from('membership_plans')
        .select('id')
        .eq('name', planName)
        .maybeSingle();

      const { error } = await supabase
        .from('transactions')
        .insert([{ user_id: user.id, plan_id: plan?.id ?? null, price }]);

      if (error) {
        console.error('Failed to save membership', error);
      }
    } catch (err) {
      console.error('Membership save error', err);
    }

    // Redirect back to profile
    router.push('/profile');
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="max-w-5xl w-full">
        <div className="mb-6">
          <button
            onClick={() => router.push('/profile')}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to Profile
          </button>
          <h1 className="text-4xl font-bold mb-6">Add Membership</h1>
        </div>

        <div className="space-y-6 max-w-2xl">
          {/* Affiliation Type */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Affiliation Type
            </label>
            <div className="px-4 py-3 border border-gray-300 rounded-md bg-gray-50">
              <p className="text-gray-700">{affiliation || 'Not specified'}</p>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Membership Price
            </label>
            <div className="px-4 py-3 border border-gray-300 rounded-md bg-gray-50">
              <p className="text-2xl font-bold text-green-600">
                {price === 0 ? 'FREE' : `$${price}`}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {price === 0 ? 'Students get free membership!' : 'Annual membership fee'}
              </p>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 ${
                !duration ? 'text-gray-400' : ''
              }`}
            >
              <option value="" className="text-gray-400">Select duration</option>
              <option value="Semester" className="text-black">Semester</option>
              <option value="Full Year" className="text-black">Full Year</option>
            </select>
          </div>

          {/* Waiver */}
          <div className="flex items-start">
            <input
              type="checkbox"
              id="waiver"
              checked={waiver}
              onChange={(e) => setWaiver(e.target.checked)}
              disabled={!hasViewedWaiver}
              className={`mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded ${
                !hasViewedWaiver ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            />
            <label htmlFor="waiver" className="text-sm text-gray-700">
              I have read and agree to the{' '}
              <button
                type="button"
                onClick={() => {
                  setShowWaiverModal(true);
                  setHasViewedWaiver(true);
                }}
                className="text-blue-600 hover:underline"
              >
                Waiver
              </button>
            </label>
          </div>

          {/* Register Button */}
          <button
            onClick={handleRegister}
            disabled={!waiver || !duration}
            className={`w-full px-6 py-3 rounded-md transition-colors ${
              waiver && duration
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Register Membership
          </button>
        </div>

        {/* Waiver Modal */}
        {showWaiverModal && (
          <div
            className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50"
            onClick={() => setShowWaiverModal(false)}
          >
            <div
              className="bg-white rounded-lg p-8 max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold mb-4">Membership Waiver</h2>
              <div className="text-gray-700 space-y-4">
                <p>
                  By accepting this waiver, you agree to the following terms and conditions:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    You understand that membership in this organization comes with certain
                    responsibilities and expectations.
                  </li>
                  <li>
                    You agree to abide by all rules, regulations, and policies set forth by
                    the organization.
                  </li>
                  <li>
                    You acknowledge that the organization is not liable for any personal injury,
                    property damage, or other losses that may occur during organization events
                    or activities.
                  </li>
                  <li>
                    You agree to conduct yourself in a professional and respectful manner at
                    all times when representing the organization.
                  </li>
                  <li>
                    You understand that membership fees are non-refundable once processed.
                  </li>
                </ul>
                <p className="font-semibold">
                  Please read this waiver carefully before agreeing to the terms.
                </p>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowWaiverModal(false)}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
