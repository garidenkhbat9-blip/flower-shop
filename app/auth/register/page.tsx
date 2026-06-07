"use client";
import { Suspense, useEffect } from "react";

import { useState } from "react";
import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword, /* FacebookAuthProvider, signInWithPopup, */ updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const ADMIN_SECRET_CODE = process.env.NEXT_PUBLIC_ADMIN_SECRET_CODE || "admin123";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">Уншиж байна...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
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
  // const [facebookLoading, setFacebookLoading] = useState(false);

  // Google popup ашиглах тул getRedirectResult устгав

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

  // 2. FACEBOOK-ЭЭР БҮРТГҮҮЛЭХ/НЭВТРЭХ (ТҮҮР COMMENT БОЛГОСОН)
  // const handleFacebookSignIn = async () => {
  //   setError("");
  //   const provider = new FacebookAuthProvider();
  //   provider.addScope('email');
  //   try {
  //     setFacebookLoading(true);
  //     const result = await signInWithPopup(auth, provider);
  //     const user = result.user;
  //     const userDocRef = doc(db, "users", user.uid);
  //     const userDocSnap = await getDoc(userDocRef);
  //
  //     if (!userDocSnap.exists()) {
  //       await setDoc(userDocRef, {
  //         email: user.email || "",
  //         displayName: user.displayName || "Facebook User",
  //         isAdmin: false,
  //         createdAt: serverTimestamp(),
  //       });
  //       router.push(nextPath.startsWith("/") ? nextPath : "/profile");
  //     } else {
  //       if (userDocSnap.data().isAdmin) router.push("/admin");
  //       else router.push(nextPath.startsWith("/") ? nextPath : "/profile");
  //     }
  //   } catch (err: any) {
  //     if (err.code !== "auth/popup-closed-by-user") {
  //       setError("Facebook-ээр нэвтрэхэд алдаа гарлаа: " + err.message);
  //     }
  //   } finally {
  //     setFacebookLoading(false);
  //   }
  // };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-rose-50 via-white to-white">
      <div className="w-full max-w-[340px] sm:max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-100 mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Бүртгүүлэх</h2>
          <p className="text-[13px] sm:text-sm text-gray-500">Хурдан захиалга хийхийн тулд шинэ хэрэглэгч үүсгээрэй.</p>
        </div>

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
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition text-gray-900"
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
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition text-gray-900"
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
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition text-gray-900"
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
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition text-gray-900"
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

          <button type="submit" disabled={loading} className="w-full bg-[#8FB596] text-white py-3.5 rounded-xl font-bold hover:bg-[#7C9F82] transition mt-4 disabled:bg-gray-400">
            {loading ? "Түр хүлээнэ үү..." : "Бүртгүүлэх"}
          </button>
        </form>

        {/* FACEBOOK ХЭСЭГ - ТҮҮР COMMENT БОЛГОСОН
        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <div className="text-xs text-gray-500">эсвэл</div>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button type="button" onClick={handleFacebookSignIn} disabled={facebookLoading} className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white py-3 rounded-xl font-bold hover:bg-[#166FE5] transition disabled:opacity-50">
          {facebookLoading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/></svg>
          ) : (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
          {facebookLoading ? "Шалгаж байна..." : "Facebook-ээр үргэлжлүүлэх"}
        </button>
        */}

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