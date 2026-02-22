import React from "react";
import {
  ShieldCheck,
  Phone,
  MessageSquare,
  MapPin,
  CheckCircle,
} from "lucide-react";

export default function SOS() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex justify-center p-6">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-orange-400 font-semibold text-lg">
              आमा-बुवा
            </h1>
            <p className="text-xs text-gray-400 tracking-wide">
              AAMABUWA
            </p>
          </div>

          <div className="w-10 h-10 rounded-full border border-orange-400 flex items-center justify-center text-orange-400 font-medium">
            B
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-semibold">SOS Monitor</h2>
          <p className="text-gray-400 text-sm">
            Real-time emergency alert status for आमा
          </p>
        </div>

        {/* Status Card */}
        <div className="border border-teal-400 rounded-2xl p-6 bg-gradient-to-br from-[#0F1E2D] to-[#0B1726] text-center shadow-lg">
          <div className="w-16 h-16 mx-auto rounded-full bg-teal-900/40 flex items-center justify-center mb-4">
            <ShieldCheck className="text-teal-400" size={28} />
          </div>

          <h3 className="text-xl font-semibold text-teal-400">
            System Status: Clear
          </h3>

          <p className="text-sm text-teal-300 mt-2 flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
            Monitoring Live
          </p>
        </div>

        {/* Simulation Center */}
        <div className="bg-[#111827] rounded-2xl p-5 space-y-4 border border-gray-800">
          <h4 className="text-xs text-gray-500 tracking-widest uppercase">
            Simulation Center
          </h4>

          <div className="space-y-3 text-gray-400 text-sm">
            <div className="flex items-center gap-3 opacity-70">
              <Phone size={16} />
              Calling Bishal (Bangalore)...
            </div>

            <div className="flex items-center gap-3 opacity-70">
              <MessageSquare size={16} />
              SMS sent to Hari ji (neighbor)...
            </div>

            <div className="flex items-center gap-3 opacity-70">
              <MapPin size={16} />
              Location shared: Lakeside, Pokhara-6
            </div>

            <div className="flex items-center gap-3 opacity-70">
              <CheckCircle size={16} />
              All contacts alerted successfully
            </div>
          </div>

          <button className="w-full mt-4 bg-orange-400 hover:bg-orange-500 transition-colors text-black font-medium py-3 rounded-xl">
            Simulate SOS Alert
          </button>
        </div>

        {/* Primary Contacts */}
        <div className="bg-[#111827] rounded-2xl border border-gray-800 divide-y divide-gray-800">
          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-900/40 text-blue-400 rounded-full flex items-center justify-center font-semibold">
                B
              </div>
              <div>
                <p className="font-medium">Bishal (Child)</p>
                <p className="text-xs text-gray-400">
                  Primary · Call & SMS
                </p>
              </div>
            </div>
            <Phone size={18} className="text-gray-400" />
          </div>

          <div className="p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-900/40 text-yellow-400 rounded-full flex items-center justify-center font-semibold">
                H
              </div>
              <div>
                <p className="font-medium">Hari ji (Neighbor)</p>
                <p className="text-xs text-gray-400">
                  Emergency · SMS Only
                </p>
              </div>
            </div>
            <MessageSquare size={18} className="text-gray-400" />
          </div>
        </div>

      </div>
    </div>
  );
}