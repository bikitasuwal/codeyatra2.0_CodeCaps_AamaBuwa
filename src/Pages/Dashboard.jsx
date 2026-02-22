import { useState } from "react";

export default function Dashboard() {
  const [selectedRole, setSelectedRole] = useState("");

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e293b] flex items-center justify-center px-4">
      <div className="w-full max-w-xl text-white">

        {/* Logo / Title */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-semibold text-orange-400 tracking-wide">
            आमा-बुबा
          </h1>
          <p className="mt-2 text-sm tracking-widest text-slate-400">
            AAMABUWA
          </p>
          <p className="mt-4 text-slate-300 italic">
            Care for your parents. Every day. From anywhere.
          </p>
          <div className="w-16 h-1 bg-orange-400 mx-auto mt-3 rounded-full"></div>
        </div>

        {/* Role Selection */}
        <p className="text-sm text-slate-400 mb-4">I AM A...</p>

        <div className="grid grid-cols-2 gap-6 mb-8">
          {/* Child / Caregiver */}
          <div
            onClick={() => setSelectedRole("child")}
            className={`p-6 rounded-xl border cursor-pointer transition-all duration-300
              ${
                selectedRole === "child"
                  ? "border-orange-400 bg-slate-800"
                  : "border-slate-700 hover:border-slate-500"
              }`}
          >
            <div className="text-4xl mb-4">👨</div>
            <h3 className="font-semibold">Child / Caregiver</h3>
            <p className="text-sm text-slate-400 mt-1">
              I care remotely
            </p>
          </div>

          {/* Parent / Elderly */}
          <div
            onClick={() => setSelectedRole("parent")}
            className={`p-6 rounded-xl border cursor-pointer transition-all duration-300
              ${
                selectedRole === "parent"
                  ? "border-orange-400 bg-slate-800"
                  : "border-slate-700 hover:border-slate-500"
              }`}
          >
            <div className="text-4xl mb-4">👵</div>
            <h3 className="font-semibold">Parent / Elderly</h3>
            <p className="text-sm text-slate-400 mt-1">
              Family takes care of me
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="mb-5">
          <label className="block text-sm text-slate-400 mb-2">
            EMAIL ADDRESS
          </label>
          <input
            type="email"
            placeholder="bishal@aamabuwa.app"
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <label className="block text-sm text-slate-400 mb-2">
            PASSWORD
          </label>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Button */}
        <button
          disabled={!selectedRole}
          className={`w-full py-3 rounded-lg font-medium transition
            ${
              selectedRole
                ? "bg-orange-500 hover:bg-orange-600"
                : "bg-slate-700 cursor-not-allowed"
            }`}
        >
          {selectedRole ? "Continue" : "Select a Role"}
        </button>

        {/* Sign Up */}
        <p className="text-center text-sm text-slate-400 mt-6">
          Don’t have an account?{" "}
          <span className="text-orange-400 cursor-pointer hover:underline">
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
}