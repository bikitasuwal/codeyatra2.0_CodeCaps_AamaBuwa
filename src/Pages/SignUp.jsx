import { useState } from "react";
import { User, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function SignUp() {
  const [selectedRole, setSelectedRole] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e293b] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-serif text-orange-400">
            Create Account
          </h1>
          <p className="mt-3 text-sm tracking-widest text-gray-400">
            AAMABUWA CARE NETWORK
          </p>
          <div className="w-12 h-[2px] bg-orange-400 mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Role Selection */}
        <div className="mb-8">
          <p className="text-xs text-gray-400 mb-4 tracking-wide">
            JOINING AS A...
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Caregiver */}
            <button
              type="button"
              onClick={() => setSelectedRole("caregiver")}
              className={`rounded-xl p-6 border transition-all duration-200 ${
                selectedRole === "caregiver"
                  ? "border-orange-400 bg-white/5"
                  : "border-gray-700 hover:border-gray-500"
              }`}
            >
              <User className="mx-auto mb-3 text-orange-400" size={40} />
              <h3 className="font-semibold">Caregiver</h3>
              <p className="text-xs text-gray-400 mt-1">
                Remote support
              </p>
            </button>

            {/* Parent */}
            <button
              type="button"
              onClick={() => setSelectedRole("parent")}
              className={`rounded-xl p-6 border transition-all duration-200 ${
                selectedRole === "parent"
                  ? "border-orange-400 bg-white/5"
                  : "border-gray-700 hover:border-gray-500"
              }`}
            >
              <Users className="mx-auto mb-3 text-orange-400" size={40} />
              <h3 className="font-semibold">Parent</h3>
              <p className="text-xs text-gray-400 mt-1">
                Daily monitoring
              </p>
            </button>
          </div>
        </div>

        {/* Form */}
        <form className="space-y-6">
          {/* Full Name */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              FULL NAME
            </label>
            <input
              type="text"
              placeholder="Your Name"
              className="w-full rounded-lg bg-transparent border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full rounded-lg bg-transparent border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              PASSWORD
            </label>
            <input
              type="password"
              placeholder="Create a password"
              className="w-full rounded-lg bg-transparent border border-gray-700 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-orange-400 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!selectedRole}
            className={`w-full py-3 rounded-lg font-medium transition ${
              selectedRole
                ? "bg-gray-700 hover:bg-gray-600 text-white"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            {selectedRole ? "Create Account" : "Select your Role"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{" "}
          <span className="text-orange-400 cursor-pointer hover:underline">
            <Link to='/'>Log in</Link>
            
          </span>
        </p>
      </div>
    </div>
  );
}