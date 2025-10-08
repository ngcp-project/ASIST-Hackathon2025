import Link from 'next/link';
import Image from 'next/image';
import { UserCircle } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="bg-gray-400 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-24">
          <div className="flex items-center">
            <Link href="/" className="hover:opacity-50">
              <Image
                src="/ASI-Website-Logo_Brand-web.webp"
                alt="ASICPP Logo"
                width={100}
                height={20}
                priority
              />
            </Link>
          </div>

          <div className="flex space-x-4">
            <Link href="/programs" className="text-sky-900 font-semibold hover:bg-gray-500 hover:text-sky-200 px-3 py-2 rounded-full flex items-center">
              Programs
            </Link>
            <Link href="/profile" className="hover:bg-gray-500 px-3 py-2 rounded-full flex items-center gap-2">
              <UserCircle size={30} />
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
