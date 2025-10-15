'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CreateAccount() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    affiliation: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    affiliation: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = {
      firstName: '',
      lastName: '',
      affiliation: '',
      email: '',
      password: '',
      confirmPassword: ''
    };

    // Validate first name
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Validate affiliation
    if (!formData.affiliation) {
      newErrors.affiliation = 'Please select an affiliation';
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Validate confirm password
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    // If no errors, save user data and proceed to profile
    if (!newErrors.firstName && !newErrors.lastName && !newErrors.affiliation && !newErrors.email && !newErrors.password && !newErrors.confirmPassword) {
      // Save user data to localStorage (including password for validation)
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        affiliation: formData.affiliation,
        email: formData.email,
        password: formData.password, // In production, NEVER store plain passwords! Use proper authentication
        fullName: `${formData.firstName} ${formData.lastName}`
      };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/profile');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center min-h-screen">
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit}>
          {/* First and Last Name Row */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="first-name" className="block text-sm font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                id="first-name"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.firstName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your first name"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="last-name" className="block text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                id="last-name"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.lastName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your last name"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
              )}
            </div>
          </div>

          {/* Affiliation Dropdown */}
          <div className="mb-4">
            <label htmlFor="affiliation" className="block text-sm font-medium mb-2">
              Affiliation
            </label>
            <select
              id="affiliation"
              name="affiliation"
              value={formData.affiliation}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.affiliation ? 'border-red-500' : 'border-gray-300'
              } ${!formData.affiliation ? 'text-gray-400' : ''}`}
            >
              <option value="" className="text-gray-400">Select your affiliation</option>
              <option value="Student" className="text-black">Student</option>
              <option value="Alumni" className="text-black">Alumni</option>
              <option value="Faculty and Staff" className="text-black">Faculty and Staff</option>
            </select>
            {errors.affiliation && (
              <p className="text-red-500 text-sm mt-1">{errors.affiliation}</p>
            )}
          </div>

          {/* Email and Password Row */}
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email}</p>
              )}
            </div>
            <div className="flex-1">
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="mb-6">
            <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              id="confirm-password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Create Account Button */}
          <button
            type="submit"
            className="w-full bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors mb-4"
          >
            Create Account
          </button>
        </form>

        {/* Sign In Link */}
        <div className="text-center">
          <span className="text-sm text-gray-600">Already have an account? </span>
          <a href="/sign-in" className="text-sm text-blue-600 hover:underline">
            Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
