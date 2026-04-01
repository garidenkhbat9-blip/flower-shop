"use client";

import { useState, useEffect, useMemo } from "react"; // useMemo нэмэв
import { auth } from "@/lib/firebase";
import { updatePassword, EmailAuthProvider, reauthenticateWithCredential, signOut, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function AdminProfile() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 1. Хэрэглэгчийн төлөвийг хянах
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push("/auth/login");
      }
    });

    return () => unsubscribe();
  }, [router]); // Энд router тогтмол байна

  // 2. Нууц үг солих функц
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    // Шалгалтууд
    if (newPassword.length < 6) {
      return setMessage({ type: "error", text: "Шинэ нууц үг дор хаяж 6 тэмдэгт байх ёстой!" });
    }
    if (newPassword !== confirmPassword) {
      return setMessage({ type: "error", text: "Шинэ нууц үгүүд таарахгүй байна!" });
    }

    setLoading(true);

    try {
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.email) {
        // Одоогийн нууц үгийг баталгаажуулах
        const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
        
        try {
          await reauthenticateWithCredential(currentUser, credential);
        } catch (err) {
          throw new Error("Одоогийн нууц үг буруу байна.");
        }

        // Нууц үг солих
        await updatePassword(currentUser, newPassword);
        
        setMessage({ type: "success", text: "Амжилттай! Нууц үг солигдлоо." });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error: any) {
      setMessage({ type: "error", text: error.message || "Алдаа гарлаа." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await signOut(auth);
    router.push("/auth/login");
  };

  if (!user) return <div className="p-10 text-center font-bold">Уншиж байна...</div>;

  return (
    <div className="min-h-full max-w-lg mx-auto px-4 py-10 space-y-6 relative">
      
      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setShowLogoutModal(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <div className="text-4xl mb-4">👋</div>
            <h3 className="text-2xl font-black text-gray-900 mb-2">Гарах уу?</h3>
            <p className="text-gray-500 mb-8">Та системээс гарахад итгэлтэй байна уу?</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleLogout} className="w-full bg-red-500 text-white font-bold py-4 rounded-2xl active:scale-95 transition">Тийм, гарах</button>
              <button onClick={() => setShowLogoutModal(false)} className="w-full bg-gray-100 text-gray-600 font-bold py-4 rounded-2xl active:scale-95 transition">Үгүй, үлдэх</button>
            </div>
          </div>
        </div>
      )}

      <div className="text-center md:text-left">
        <h1 className="text-2xl font-black text-gray-900 uppercase italic">Admin Profile</h1>
        <p className="text-gray-400 text-sm">{user.email}</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-2xl text-sm font-bold border animate-in slide-in-from-top-2 ${
          message.type === "success" ? "bg-green-50 text-green-700 border-green-100" : "bg-red-50 text-red-700 border-red-100"
        }`}>
          {message.text}
        </div>
      )}

      <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 space-y-6">
        <h2 className="font-bold text-gray-800">🔐 Нууц үг солих</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <input 
            type="password" placeholder="Одоогийн нууц үг" required 
            value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full bg-gray-50 border-none ring-1 ring-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none" 
          />
          <div className="h-px bg-gray-100 my-2"></div>
          <input 
            type="password" placeholder="Шинэ нууц үг" required 
            value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
            className="w-full bg-gray-50 border-none ring-1 ring-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none" 
          />
          <input 
            type="password" placeholder="Шинэ нууц үг давтах" required 
            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-gray-50 border-none ring-1 ring-gray-100 p-4 rounded-2xl focus:ring-2 focus:ring-green-500 outline-none" 
          />
          <button 
            type="submit"
            disabled={loading} 
            className="w-full bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? "Түр хүлээнэ үү..." : "Шинэчлэх"}
          </button>
        </form>
      </section>

      <button onClick={() => setShowLogoutModal(true)} className="w-full py-4 text-red-500 font-bold border-2 border-red-50 border-dashed rounded-2xl hover:bg-red-50 transition">🛑 Системээс гарах</button>
    </div>
  );
}