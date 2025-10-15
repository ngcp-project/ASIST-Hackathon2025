'use client'
// Sign-in page component
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function SignIn() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ email: '', password: '' })
  const [pending, setPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)
    const newErrors = { email: '', password: '' }

    if (!email.trim()) newErrors.email = 'Email is required'
    else if (!validateEmail(email)) newErrors.email = 'Please enter a valid email'
    if (!password.trim()) newErrors.password = 'Password is required'
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    setErrors(newErrors)
    if (newErrors.email || newErrors.password) return

    try {
      setPending(true)
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      router.push('/profile')
    } catch (err: any) {
      setServerError(err?.message ?? 'Sign-in failed')
    } finally {
      setPending(false)
    }

    // Validate password
    if (!password.trim()) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    // If no errors, verify credentials
    if (!newErrors.email && !newErrors.password) {
      // Check if user exists in localStorage
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);

        // Verify email and password match
        if (userData.email === email && userData.password === password) {
          // Credentials match, set login state and proceed to profile
          localStorage.setItem('isLoggedIn', 'true');
          router.push('/profile');
        } else {
          // Credentials don't match
          if (userData.email !== email) {
            newErrors.email = 'Email not found';
          }
          if (userData.password !== password) {
            newErrors.password = 'Incorrect password';
          }
          setErrors(newErrors);
        }
      } else {
        // No account found
        newErrors.email = 'No account found. Please create an account first.';
        setErrors(newErrors);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center min-h-screen">
      <div className="w-full max-w-md">
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email" id="email" value={email} onChange={e=>setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your email"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password" id="password" value={password} onChange={e=>setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Enter your password"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="w-full max-w-md space-y-4">
            <button type="submit" disabled={pending} className="w-full bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50">
              {pending ? 'Signing in…' : 'Sign In'}
            </button>
          </div>

          {serverError && <p className="text-red-600 text-sm mt-3">{serverError}</p>}
        </form>

        <div className="text-center mt-4">
          <a href="/create-account" className="text-sm text-blue-600 hover:underline">Create Account</a>
        </div>
      </div>
    </div>
  )
}
