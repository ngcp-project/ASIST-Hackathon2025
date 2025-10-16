"use client";

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <button
      onClick={handleSignOut}
      className="mt-6 bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors w-1/2"
    >
      Sign Out
    </button>
  );
}
