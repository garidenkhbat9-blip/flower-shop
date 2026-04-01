"use client";

import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LogoutModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">👋</div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">Гарах уу?</h3>
        <p className="text-gray-500 mb-8 leading-relaxed">Та системээс гарвал дахин нэвтрэх шаардлагатай болно.</p>
        <div className="flex flex-col gap-3">
          <button onClick={handleLogout} className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl active:scale-95 transition">Тийм, гарах</button>
          <button onClick={onClose} className="w-full bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl active:scale-95 transition">Үгүй, үлдэх</button>
        </div>
      </div>
    </div>
  );
}