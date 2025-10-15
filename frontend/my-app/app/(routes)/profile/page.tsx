'use client';

import Link from 'next/link';
import { UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Profile() {
  const router = useRouter();
  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("");
  const [userAffiliation, setUserAffiliation] = useState("");
  const [userId, setUserId] = useState("");
  const [membershipType, setMembershipType] = useState("None");
  const [startDate, setStartDate] = useState("-");
  const [expireDate, setExpireDate] = useState("-");
  const [hasMembership, setHasMembership] = useState(false);

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUserName(userData.fullName);
      setUserEmail(userData.email);
      setUserAffiliation(userData.affiliation || "Not specified");
      // Generate a placeholder ID (you can replace this with actual ID from database later)
      setUserId(`ID-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);

      // Check if user has membership data
      if (userData.membership) {
        setMembershipType(userData.membership.type);
        setStartDate(userData.membership.startDate);
        setExpireDate(userData.membership.expireDate);
        setHasMembership(true);
      }
    }
  }, []);

  const handleSignOut = () => {
    // Set login state to false (keep account data)
    localStorage.setItem('isLoggedIn', 'false');
    // Redirect to sign-in page
    router.push('/sign-in');
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center">
      <div className="max-w-5xl w-full">
        <div className="flex gap-8">
          {/* Left Side - Profile Avatar and Name */}
          <div className="w-64 flex flex-col items-center">
            <div className="mb-4">
              <UserCircle size={150} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-center">{userName}</h2>
            {userId && (
              <p className="text-sm text-gray-600 mt-2">{userId}</p>
            )}
            <button
              onClick={handleSignOut}
              className="mt-6 bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 transition-colors w-1/2"
            >
              Sign Out
            </button>
          </div>

          {/* Right Side - Profile Content */}
          <div className="flex-1">
            {/* Membership Information */}
            <div className="mb-8">
              <div className="space-y-3 mb-6">
                <div className="flex items-center">
                  <span className="font-semibold w-40">Membership Type:</span>
                  <span className="text-gray-600">{membershipType}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-40">Start Date:</span>
                  <span className="text-gray-600">{startDate}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-40">Expire Date:</span>
                  <span className="text-gray-600">{expireDate}</span>
                </div>
              </div>
              {!hasMembership && (
                <Link href="/profile/membership">
                  <button className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors">
                    Add Membership
                  </button>
                </Link>
              )}
            </div>

            {/* Personal Info Section */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Personal Info</h2>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="font-semibold w-32">Name:</span>
                  <span className="text-gray-600">{userName}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-32">Email:</span>
                  <span className="text-gray-600">{userEmail}</span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold w-32">Affiliation:</span>
                  <span className="text-gray-600">{userAffiliation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
