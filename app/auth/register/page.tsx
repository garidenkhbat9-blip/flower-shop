"use client";
import { Suspense } from "react";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const ADMIN_SECRET_CODE = process.env.NEXT_PUBLIC_ADMIN_SECRET_CODE || "admin123";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "";
  const showAdminCode = searchParams.get("admin") === "1";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [adminCode, setAdminCode] = useState(""); 
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 1. ИМЭЙЛ, НУУЦ ҮГЭЭР БҮРТГҮҮЛЭХ
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        setError("Нууц үг таарахгүй байна.");
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      const isAdmin = showAdminCode && adminCode === ADMIN_SECRET_CODE;

      if (fullName.trim()) {
        await updateProfile(user, { displayName: fullName.trim() });
      }

      // Firestore руу хэрэглэгчийн мэдээлэл хадгалах
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        displayName: fullName.trim() || user.displayName || "",
        isAdmin: isAdmin,
        createdAt: serverTimestamp(),
      });

      // Зөв код хийсэн бол Админ хуудас руу шилжүүлэх
      if (isAdmin) router.push("/admin");
      else router.push(nextPath.startsWith("/") ? nextPath : "/profile");

    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") setError("Энэ имэйл бүртгэлтэй байна.");
      else if (err.code === "auth/weak-password") setError("Нууц үг дор хаяж 6 тэмдэгт байх ёстой.");
      else setError("Алдаа гарлаа: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. GOOGLE-ЭЭР БҮРТГҮҮЛЭХ/НЭВТРЭХ
  const handleGoogleSignIn = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Google-ээр орсон хүн анх удаа орж байна уу (Firestore-т мэдээлэл нь байна уу?) шалгах
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        // Анх удаа орж байвал шинээр мэдээлэл хадгалах (Google-ээр орсон хүн шууд админ болох боломжгүй тул isAdmin: false байна)
        await setDoc(userDocRef, {
          email: user.email,
          displayName: user.displayName,
          isAdmin: false, 
          createdAt: serverTimestamp(),
        });
        router.push(nextPath.startsWith("/") ? nextPath : "/profile");
      } else {
        // Өмнө нь бүртгүүлсэн бол админ эсэхийг нь шалгаад шилжүүлэх
        if (userDocSnap.data().isAdmin) router.push("/admin");
        else router.push(nextPath.startsWith("/") ? nextPath : "/profile");
      }
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") setError("Google-ээр нэвтрэхэд алдаа гарлаа.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-rose-50 via-white to-white">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-black tracking-tight text-gray-900">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">UF</span>
            <span>Unur Flowers</span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">Хурдан захиалга хийхийн тулд шинэ хэрэглэгч үүсгээрэй.</p>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Бүртгүүлэх</h2>

        {error && <p className="text-red-600 text-sm mb-4 text-center bg-red-50 p-3 rounded-lg font-medium">{error}</p>}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Нэр</label>
            <input
              type="text"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Таны нэр"
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Имэйл</label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Нууц үг</label>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Нууц үг давтах</label>
            <input
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition"
            />
          </div>
          
          {/* АДМИН КОД (зөвхөн admin=1 query үед) */}
          {showAdminCode ? (
            <div className="pt-2 border-t mt-4">
              <label className="block text-xs font-bold text-gray-500 mb-1">Админ код (Зөвхөн ажилчид)</label>
              <input
                type="password"
                placeholder="Админ код"
                value={adminCode}
                onChange={(e) => setAdminCode(e.target.value)}
                className="w-full border border-dashed border-gray-300 bg-gray-50 p-3 rounded-xl focus:ring-2 focus:ring-gray-400 outline-none text-sm"
              />
            </div>
          ) : null}

          <button type="submit" disabled={loading} className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition mt-4 disabled:bg-gray-400">
            {loading ? "Түр хүлээнэ үү..." : "Бүртгүүлэх"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <div className="text-xs text-gray-500">эсвэл</div>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* GOOGLE ТОВЧ */}
        <button type="button" onClick={handleGoogleSignIn} className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-50 transition">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google-ээр үргэлжлүүлэх
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          Бүртгэлтэй юу?{" "}
          <Link href={nextPath ? `/auth/login?next=${encodeURIComponent(nextPath)}` : "/auth/login"} className="text-black font-bold hover:underline">
            Энд дарж нэвтэрнэ үү
          </Link>
        </div>
      </div>
    </div>
  );
}