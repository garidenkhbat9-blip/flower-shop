"use client";

import { useState, useEffect, Suspense } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, FacebookAuthProvider, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isForgotPassword, setIsForgotPassword] = useState(false); // Нууц үг сэргээх цонх мөн эсэх

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [facebookLoading, setFacebookLoading] = useState(false);

  const nextPath = searchParams.get("next") || "";

  // Google popup ашиглах тул getRedirectResult устгав

  // 1. ИМЭЙЛ, НУУЦ ҮГЭЭР НЭВТРЭХ
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      // Админ эсвэл хүргэлт эсэхийг нь шалгах
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const data = userDocSnap.data();
        if (data.isAdmin || data.role === "admin") {
          router.push("/admin");
        } else if (data.role === "delivery") {
          router.push("/delivery");
        } else {
          router.push(nextPath.startsWith("/") ? nextPath : "/profile");
        }
      } else {
        router.push(nextPath.startsWith("/") ? nextPath : "/profile");
      }
    } catch (err: any) {
      if (err.code === "auth/invalid-credential") setError("Имэйл эсвэл нууц үг буруу байна.");
      else setError("Алдаа гарлаа: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. FACEBOOK-ЭЭР НЭВТРЭХ
  const handleFacebookSignIn = async () => {
    setError("");
    const provider = new FacebookAuthProvider();
    provider.addScope('email');
    try {
      setFacebookLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, { email: user.email || "", displayName: user.displayName || "Facebook User", isAdmin: false, createdAt: serverTimestamp() });
        router.push(nextPath.startsWith("/") ? nextPath : "/profile");
      } else {
        const data = userDocSnap.data();
        if (data.isAdmin || data.role === "admin") router.push("/admin");
        else if (data.role === "delivery") router.push("/delivery");
        else router.push(nextPath.startsWith("/") ? nextPath : "/profile");
      }
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError("Facebook-ээр нэвтрэхэд алдаа гарлаа: " + err.message);
      }
    } finally {
      setFacebookLoading(false);
    }
  };

  // 3. НУУЦ ҮГ СЭРГЭЭХ
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email) {
      setError("Имэйл хаягаа оруулна уу.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMsg("Нууц үг сэргээх холбоосыг таны имэйл рүү илгээлээ!");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") setError("Бүртгэлгүй имэйл байна.");
      else if (err.code === "auth/invalid-email") setError("Имэйл хаяг буруу байна.");
      else setError("Алдаа гарлаа: " + err.message);
    }
  };

  // ==================== НУУЦ ҮГ СЭРГЭЭХ ЦОНХНЫ UI ====================
  if (isForgotPassword) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-rose-50 via-white to-white">
        <div className="w-full max-w-[340px] sm:max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-100 mx-auto">


          <h2 className="text-2xl font-bold mb-2 text-center text-gray-900">Нууц үг сэргээх</h2>
          <p className="text-sm text-gray-500 text-center mb-6">Имэйлээ оруулна уу — бид танд сэргээх холбоос илгээх болно.</p>

          {error && <p className="text-red-600 text-sm mb-4 text-center bg-red-50 p-3 rounded-lg font-medium">{error}</p>}
          {successMsg && <p className="text-green-700 text-sm mb-4 text-center font-medium bg-green-50 p-3 rounded-lg">{successMsg}</p>}

          <form onSubmit={handleResetPassword} className="space-y-4">
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
            <button type="submit" className="w-full bg-black text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition">
              Холбоос илгээх
            </button>
          </form>

          <button
            onClick={() => {
              setIsForgotPassword(false);
              setError("");
              setSuccessMsg("");
            }}
            className="w-full mt-4 text-sm font-bold text-gray-600 hover:text-black underline"
          >
            Буцах
          </button>
        </div>
      </div>
    );
  }

  // ==================== ҮНДСЭН НЭВТРЭХ ЦОНХНЫ UI ====================
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-rose-50 via-white to-white">
      <div className="w-full max-w-[340px] sm:max-w-md p-6 sm:p-8 bg-white rounded-2xl shadow-sm border border-gray-100 mx-auto">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2 text-gray-900">Нэвтрэх</h2>
          <p className="text-[13px] sm:text-sm text-gray-500">Захиалга, хүргэлтээ хурдан шалгахын тулд нэвтэрнэ үү.</p>
        </div>

        {error && <p className="text-red-600 text-sm mb-4 text-center bg-red-50 p-3 rounded-lg font-medium">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
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
              autoComplete={rememberMe ? "current-password" : "off"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition text-gray-900"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700 select-none cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300"
              />
              Намайг сана
            </label>
            {nextPath ? (
              <span className="text-xs text-gray-500">Нэвтэрсний дараа буцаад шилжинэ</span>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition mt-4 disabled:bg-gray-400"
          >
            {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <div className="text-xs text-gray-500">эсвэл</div>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <button
          type="button"
          onClick={handleFacebookSignIn}
          disabled={facebookLoading}
          className="w-full flex items-center justify-center gap-2 bg-[#1877F2] text-white py-3 rounded-xl font-bold hover:bg-[#166FE5] transition disabled:opacity-50"
        >
          {facebookLoading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25" /><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75" /></svg>
          ) : (
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
          )}
          {facebookLoading ? "Шалгаж байна..." : "Facebook-ээр үргэлжлүүлэх"}
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          Бүртгэлгүй юу?{" "}
          <Link href={nextPath ? `/auth/register?next=${encodeURIComponent(nextPath)}` : "/auth/register"} className="text-black font-bold hover:underline">
            Энд дарж бүртгүүлнэ үү
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">Уншиж байна...</div>}>
      <LoginContent />
    </Suspense>
  );
}