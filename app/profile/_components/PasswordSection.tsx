"use client";
import { useState } from "react";
import { Key, Lock, Eye, CheckCircle2 } from "lucide-react";

export default function PasswordSection() {
  const [showPass, setShowPass] = useState(false);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h2 className="text-xl font-black text-gray-900">Аюулгүй байдал</h2>
        <p className="text-sm text-gray-400">Та эндээс нэвтрэх нууц үгээ солих боломжтой.</p>
      </div>

      <form className="space-y-6 max-w-2xl">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Одоогийн нууц үг</label>
          <div className="relative">
            <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
            <input 
              type={showPass ? "text" : "password"}
              className="w-full bg-gray-50 border-none ring-1 ring-gray-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-teal-400 outline-none transition" 
              placeholder="••••••••"
            />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600">
              <Eye className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Шинэ нууц үг</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input 
                type={showPass ? "text" : "password"}
                className="w-full bg-gray-50 border-none ring-1 ring-gray-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-teal-400 outline-none transition" 
                placeholder="••••••••"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Нууц үг давтах</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
              <input 
                type={showPass ? "text" : "password"}
                className="w-full bg-gray-50 border-none ring-1 ring-gray-100 p-4 pl-12 rounded-2xl focus:ring-2 focus:ring-teal-400 outline-none transition" 
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="w-full md:w-auto px-8 bg-[#4fd1c5] hover:bg-[#38b2ac] text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-teal-100 active:scale-95">
            Нууц үг шинэчлэх
          </button>
        </div>
      </form>
    </div>
  );
}