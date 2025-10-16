'use client'
// component to represent the navigation bar of the application.
import Link from 'next/link';
import Image from 'next/image';
import { UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  // start false to avoid accidental navigation to /profile before we know state
  const [isSignedIn, setIsSignedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const supabase = createClient();
    let mounted = true;

    supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setIsSignedIn(!!data.user);
      setLoading(false);
    }).catch(() => {
      if (!mounted) return;
      setIsSignedIn(false);
      setLoading(false);
    });

    // Listen for sign-in/sign-out events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setIsSignedIn(!!session?.user);
      setLoading(false);
    });

    return () => { mounted = false; listener?.subscription?.unsubscribe(); };
  }, []);

  return (
    <nav className="bg-gray-300 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-50">
              <Image
                src="/ASI-Website-Logo_Brand-web.webp"
                alt="ASICPP Logo"
                width={80}
                height={20}
                priority
              />
            </Link>
          </div>

          <div className="flex space-x-4">
            <Link href="/programs" className="text-sky-900 font-semibold hover:bg-gray-200 hover:opacity-50 px-3 py-2 rounded-full flex items-center text-lg">
              Programs
            </Link>
            <Link
              href={isSignedIn ? "/profile" : "/sign-in"}
              className={`hover:bg-gray-200 hover:opacity-50 px-3 py-2 rounded-full flex items-center gap-2 ${loading ? 'pointer-events-none opacity-60' : ''}`}
              aria-disabled={loading}
            >
              <UserCircle size={40} className="text-sky-900" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
