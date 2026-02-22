import {
  Clock,
  Sun,
  Moon,
  CheckCircle,
  Check,
  AlertCircle,
} from "lucide-react";

export default function HomeP() {
  return (
    <div className="min-h-screen bg-[#f5efe8] flex justify-center py-6 px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Header */}
        <div>
          <button className="text-sm text-gray-600 mb-2">
            ← पछाडि (Back)
          </button>

          <h1 className="text-3xl font-bold text-orange-600">
            आमा-बुवा
          </h1>

          <p className="text-lg mt-2">
            नमस्ते, आमा 🙏
          </p>

          <p className="text-gray-500">
            शुभ साँझ (Good evening)
          </p>
        </div>

        {/* Morning Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex items-center justify-center text-gray-400 text-sm gap-2">
            <Clock size={16} />
            <span>SCHEDULED : 8:00 AM</span>
          </div>

          <div className="flex justify-center">
            <Sun className="text-orange-400" size={60} />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold">
              बिहानको औषधि लिनुभयो?
            </h2>
            <p className="text-gray-500 text-sm">
              Did you take your morning medicine?
            </p>
          </div>

          <button className="w-full bg-green-100 text-green-700 py-3 rounded-xl flex items-center justify-center gap-2 font-medium">
            <CheckCircle size={18} />
            औषधि लिइसक्नु भयो!
          </button>
        </div>

        {/* Evening Card */}
        <div className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <div className="flex items-center justify-center text-gray-400 text-sm gap-2">
            <Clock size={16} />
            <span>SCHEDULED : 7:00 PM</span>
          </div>

          <div className="flex justify-center">
            <Moon className="text-yellow-400" size={60} />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-semibold">
              बेलुकाको औषधि लिनुभयो?
            </h2>
            <p className="text-gray-500 text-sm">
              Did you take your evening medicine?
            </p>
          </div>

          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 font-medium">
            <Check size={18} />
            लिँए (Yes, taken)
          </button>
        </div>

        {/* Emergency Section */}
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-4">
          <h2 className="text-xl font-bold text-red-600">
            आपकाल – EMERGENCY
          </h2>

          <p className="text-sm text-red-400">
            यदि तपाईलाई तुरुन्त मदत चाहिन्छ भने थिच्नुहोस्
          </p>

          <div className="flex justify-center">
            <button className="w-32 h-32 rounded-full bg-red-600 text-white text-xl font-bold shadow-lg flex items-center justify-center hover:bg-red-700 transition">
              SOS
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}