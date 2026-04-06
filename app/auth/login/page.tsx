"use client";

import { useState, useEffect, Suspense } from "react";
import { auth, db } from "@/lib/firebase";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithRedirect, getRedirectResult, sendPasswordResetEmail } from "firebase/auth";
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
  const [googleLoading, setGoogleLoading] = useState(false);

  const nextPath = searchParams.get("next") || "";

  // Google redirect-ээс буцаж ирэхэд үр дүнг боловсруулах
  useEffect(() => {
    setGoogleLoading(true);
    getRedirectResult(auth)
      .then(async (result) => {
        if (result) {
          const user = result.user;
          const userDocRef = doc(db, "users", user.uid);
          const userDocSnap = await getDoc(userDocRef);

          if (!userDocSnap.exists()) {
            await setDoc(userDocRef, { email: user.email, displayName: user.displayName, isAdmin: false, createdAt: serverTimestamp() });
            router.push(nextPath.startsWith("/") ? nextPath : "/profile");
          } else {
            if (userDocSnap.data().isAdmin) router.push("/admin");
            else router.push(nextPath.startsWith("/") ? nextPath : "/profile");
          }
        }
      })
      .catch((err) => {
        if (err.code !== "auth/popup-closed-by-user") {
          setError("Google-ээр нэвтрэхэд алдаа гарлаа.");
        }
      })
      .finally(() => {
        setGoogleLoading(false);
      });
  }, []);

  // 1. ИМЭЙЛ, НУУЦ ҮГЭЭР НЭВТРЭХ
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Админ эсэхийг нь шалгах
      const userDocRef = doc(db, "users", userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists() && userDocSnap.data().isAdmin) {
        router.push("/admin"); 
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

  // 2. GOOGLE-ЭЭР НЭВТРЭХ (redirect ашиглана - утсанд тохиромжтой)
  const handleGoogleSignIn = async () => {
    setError("");
    const provider = new GoogleAuthProvider();
    try {
      await signInWithRedirect(auth, provider);
      // Redirect хийсний дараа хуудас дахин ачаалагдана, getRedirectResult useEffect-д боловсруулагдана
    } catch (err: any) {
      setError("Google-ээр нэвтрэхэд алдаа гарлаа.");
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
        <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <div className="text-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2 font-black tracking-tight text-gray-900">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">UF</span>
              <span>Unur Flowers</span>
            </Link>
          </div>

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
                className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition"
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
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 font-black tracking-tight text-gray-900">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-black text-white">UF</span>
            <span>Unur Flowers</span>
          </Link>
          <p className="mt-2 text-sm text-gray-500">Захиалга, хүргэлтээ хурдан шалгахын тулд нэвтэрнэ үү.</p>
        </div>

        <h2 className="text-2xl font-bold mb-6 text-center text-gray-900">Нэвтрэх</h2>

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
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-gray-700">Нууц үг</label>
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setError("");
                }}
                className="text-xs font-semibold text-gray-700 hover:text-black underline underline-offset-4"
              >
                Нууц үгээ мартсан уу?
              </button>
            </div>
            <input
              type="password"
              autoComplete={rememberMe ? "current-password" : "off"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 p-3 rounded-xl focus:ring-2 focus:ring-black/10 focus:border-black outline-none transition"
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
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-800 py-3 rounded-xl font-bold hover:bg-gray-50 transition disabled:opacity-50"
        >
          {googleLoading ? (
            <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-25"/><path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="opacity-75"/></svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          )}
          {googleLoading ? "Шалгаж байна..." : "Google-ээр үргэлжлүүлэх"}
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