import { Plus, Phone, Calendar, Pill, Heart, Trash2 } from "lucide-react";

export default function Task() {
  return (
    <div className="min-h-screen bg-[#0B1220] text-white flex justify-center p-6">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-orange-400 text-xl font-semibold">आमा-बुवा</h1>
            <p className="text-xs text-gray-400 tracking-widest">AAMABUWA</p>
          </div>

          <div className="w-10 h-10 rounded-full border border-orange-400 flex items-center justify-center text-orange-400">
            B
          </div>
        </div>

        {/* Title Section */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold">My Tasks</h2>
            <p className="text-gray-400 text-sm">
              Manage care routines and errands.
            </p>
          </div>

          <button className="bg-orange-400 hover:bg-orange-500 transition p-3 rounded-full">
            <Plus size={20} className="text-black" />
          </button>
        </div>

        {/* Active Tasks */}
        <p className="text-xs text-gray-500 mb-3">ACTIVE TASKS</p>

        <div className="space-y-4">
          <TaskCard
            title="Call आमा this evening"
            icon={<Phone size={16} />}
            tag="CALL"
            tagColor="text-blue-400"
            date="TODAY"
          />

          <TaskCard
            title="Refill Metformin prescription"
            icon={<Pill size={16} />}
            tag="MEDICINE"
            tagColor="text-green-400"
            date="SATURDAY"
          />

          <TaskCard
            title="Book follow-up with Dr. Thapa"
            icon={<Heart size={16} />}
            tag="MEDICAL"
            tagColor="text-red-400"
            date="FRIDAY"
          />
        </div>

        {/* Completed Section */}
        <p className="text-xs text-gray-500 mt-8 mb-3">
          COMPLETED RECENTLY
        </p>

        <div className="bg-[#111827] rounded-xl p-4 flex items-center justify-between opacity-70">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-green-500/20 flex items-center justify-center">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
            </div>
            <p className="line-through text-gray-400">
              Arrange grocery delivery
            </p>
          </div>
          <Trash2 size={16} className="text-gray-500 cursor-pointer" />
        </div>

      </div>
    </div>
  );
}

function TaskCard({ title, icon, tag, tagColor, date }) {
  return (
    <div className="bg-[#111827] rounded-xl p-4 flex items-start gap-4 hover:bg-[#1A2233] transition cursor-pointer">
      
      {/* Checkbox */}
      <div className="w-5 h-5 rounded-md border-2 border-orange-400 mt-1" />

      {/* Content */}
      <div className="flex-1">
        <p className="font-medium">{title}</p>

        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
          <div className={`flex items-center gap-1 ${tagColor}`}>
            {icon}
            <span>{tag}</span>
          </div>

          <div className="flex items-center gap-1">
            <Calendar size={14} />
            <span>{date}</span>
          </div>
        </div>
      </div>
    </div>
  );
}