"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const router = useRouter();
  useEffect(() => {
    const run = async () => {
      const supabase = createClient();
      // Supabase redirects with code in URL; let supabase-js finalize the session
      // Newer versions support getSessionFromUrl via _getSessionFromURL under the hood via refresh.
      try {
        // Force a getSession to ensure cookies are set
        await supabase.auth.getSession();
      } catch {}

      // Apply pending profile if any
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const pending = typeof window !== 'undefined' ? localStorage.getItem('pending_profile') : null;
          if (pending) {
            const profile = JSON.parse(pending);
            // apply role if present in pending profile
            const updatePayload: any = {
              first_name: profile.first_name,
              last_name: profile.last_name,
              affiliation: profile.affiliation
            };
            if (profile.role) updatePayload.role = profile.role;

            const { error } = await supabase
              .from('users')
              .update(updatePayload)
              .eq('id', user.id);
            if (!error) localStorage.removeItem('pending_profile');
          }
        }
      } catch {}

      router.replace('/profile');
    };
    run();
  }, [router]);

  return (
    <div className="container mx-auto px-4 py-16">
      <p>Finishing sign-in…</p>
    </div>
  );
}
