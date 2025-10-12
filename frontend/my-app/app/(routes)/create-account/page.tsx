export default function CreateAccount() {
  return (
    <div className="container mx-auto px-4 py-8 flex justify-center min-h-screen">
      <div className="w-full max-w-2xl">
        {/* First and Last Name Row */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label htmlFor="first-name" className="block text-sm font-medium mb-2">
              First Name
            </label>
            <input
              type="text"
              id="first-name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your first name"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="last-name" className="block text-sm font-medium mb-2">
              Last Name
            </label>
            <input
              type="text"
              id="last-name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your last name"
            />
          </div>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email"
            />
          </div>
          <div className="flex-1">
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your password"
            />
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
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Confirm your password"
          />
        </div>

        {/* Create Account Button */}
        <button className="w-full bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600 transition-colors mb-4">
          Create Account
        </button>

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
