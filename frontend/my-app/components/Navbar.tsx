'use client'
// component to represent the navigation bar of the application.
import Link from 'next/link';
import Image from 'next/image';
import { UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const [isSignedIn, setIsSignedIn] = useState<boolean | null>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setIsSignedIn(!!data.user);
    });
    // Listen for sign-in/sign-out events
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsSignedIn(!!session?.user);
    });
    return () => { listener?.subscription.unsubscribe(); };
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
            <Link href={isSignedIn ? "/profile" : "/sign-in"} className="hover:bg-gray-200 hover:opacity-50 px-3 py-2 rounded-full flex items-center gap-2">
              <UserCircle size={40} className="text-sky-900" />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
