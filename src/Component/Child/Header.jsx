import { useState } from "react";

export default function Header() {
  const [user] = useState({
    name: "Bishal",
  });

  const firstLetter = user.name.charAt(0).toUpperCase();

  return (
    <header className="w-full bg-[#0b1220] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo Section */}
        <div>
          <h1 className="text-2xl font-semibold text-orange-400 tracking-wide">
            आमा-बुबा
          </h1>
          <p className="text-xs tracking-widest text-slate-400">
            AAMABUWA
          </p>
        </div>

        {/* Profile Circle */}
        <div className="flex items-center">
          <div className="w-11 h-11 rounded-full border-2 border-orange-400 flex items-center justify-center text-orange-400 font-semibold text-lg cursor-pointer hover:bg-orange-400 hover:text-black transition">
            {firstLetter}
          </div>
        </div>

      </div>
    </header>
  );
}