'use client';

import { UserCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Profile() {
  const [userName, setUserName] = useState("Guest");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    // Retrieve user data from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUserName(userData.fullName);
      setUserEmail(userData.email);
    }
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Left Side - Profile Avatar and Name */}
        <div className="w-64 flex flex-col items-center">
          <div className="mb-4">
            <UserCircle size={150} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-center">{userName}</h2>
          {userEmail && (
            <p className="text-sm text-gray-600 mt-2">{userEmail}</p>
          )}
        </div>

        {/* Right Side - Profile Content */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold mb-6">Profile</h1>
          <div className="space-y-6">
            <p className="text-lg">
              Welcome to your profile page!
            </p>
            {/* Add your profile content here */}
          </div>
        </div>
      </div>
    </div>
  );
}
