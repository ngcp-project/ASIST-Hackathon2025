'use client'
// Create Account page component
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function CreateAccount() {
  const router = useRouter()
  const supabase = createClient()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [pending, setPending] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setServerError(null)

    const newErrors = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '' }
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim())  newErrors.lastName  = 'Last name is required'
    if (!formData.email.trim())     newErrors.email     = 'Email is required'
    else if (!emailOk)              newErrors.email     = 'Please enter a valid email'
    if (!formData.password.trim())  newErrors.password  = 'Password is required'
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters'
    if (!formData.confirmPassword.trim()) newErrors.confirmPassword = 'Please confirm your password'
    else if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match'

    setErrors(newErrors)
    if (Object.values(newErrors).some(Boolean)) return

    try {
      setPending(true)

      // 1) Sign up auth user (DB trigger will create public.users row)
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password
      })
      if (signUpError) throw signUpError

      // 2) If email confirmation is ON, no session yet
      if (!signUpData.session) {
        alert('Check your email to confirm your account. Then sign in.')
        return
      }

      // 3) If we already have a session, update names on the profile row
      const user = signUpData.user!
      const { error: updateErr } = await supabase
        .from('users')
        .update({ first_name: formData.firstName, last_name: formData.lastName })
        .eq('id', user.id)
      if (updateErr) throw updateErr

      router.push('/profile')
    } catch (err: any) {
      setServerError(err?.message ?? 'Something went wrong')
    } finally {
      setPending(false)
    }

    // Validate last name
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
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
    if (!newErrors.firstName && !newErrors.lastName && !newErrors.email && !newErrors.password && !newErrors.confirmPassword) {
      // Save user data to localStorage (including password for validation)
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password, // In production, NEVER store plain passwords! Use proper authentication
        fullName: `${formData.firstName} ${formData.lastName}`
      };
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/profile');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="container mx-auto px-4 py-8 flex justify-center min-h-screen">
      <div className="w-full max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">First Name</label>
              <input name="firstName" value={formData.firstName} onChange={handleChange}
                     className={`w-full px-4 py-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Last Name</label>
              <input name="lastName" value={formData.lastName} onChange={handleChange}
                     className={`w-full px-4 py-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                     className={`w-full px-4 py-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                     className={`w-full px-4 py-2 border rounded-md ${errors.password ? 'border-red-500' : 'border-gray-300'}`} />
              {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                   className={`w-full px-4 py-2 border rounded-md ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`} />
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          <button type="submit" disabled={pending}
                  className="w-full bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50">
            {pending ? 'Creating…' : 'Create Account'}
          </button>

          {serverError && <p className="text-red-600 text-sm mt-3">{serverError}</p>}
        </form>

        <div className="text-center mt-4">
          <span className="text-sm text-gray-600">Already have an account? </span>
          <a href="/sign-in" className="text-sm text-blue-600 hover:underline">Sign In</a>
        </div>
      </div>
    </div>
  )
}
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

