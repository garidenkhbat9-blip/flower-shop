"use client";

import { Home, Percent, User, ChevronDown, LayoutDashboard } from "lucide-react"; // LayoutDashboard icon нэмлээ
import Link from "next/link";
import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase"; // auth нэмэгдсэн
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function MobileBottomNav() {
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  // --- ШИНЭ: Админ эрх шалгах state-үүд ---
  const [isAdmin, setIsAdmin] = useState(false);
  const [profilePath, setProfilePath] = useState("/profile");

  // 1. Категориудыг татах
  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const catList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setDbCategories(catList);
    });
    return () => unsubscribe();
  }, []);

  // 2. Хэрэглэгчийн эрхийг шалгаж, Profile-ын замыг шинэчлэх
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Хэрэглэгч нэвтэрсэн бол Firestore-оос isAdmin эсэхийг шалгана
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().isAdmin === true) {
            setIsAdmin(true);
            setProfilePath("/admin"); // Админ бол админ самбар руу
          } else {
            setIsAdmin(false);
            setProfilePath("/profile"); // Энгийн хэрэглэгч бол профайл руу
          }
        } catch (error) {
          console.error("Эрх шалгахад алдаа гарлаа:", error);
          setProfilePath("/profile");
        }
      } else {
        // Нэвтрээгүй бол шууд profile (нэвтрэх хуудас руу)
        setIsAdmin(false);
        setProfilePath("/profile");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      {/* 1. ГАР УТАСНЫ АНГИЛАЛЫН ЦЭС (Overlay) - ӨӨРЧЛӨГДӨӨГҮЙ */}
      {isCategoryOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-[60] pt-16 pb-20 overflow-y-auto animate-in slide-in-from-bottom-2">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900">Бүх ангилал</h2>
            <button
              onClick={() => setIsCategoryOpen(false)}
              className="text-gray-400 text-sm font-bold"
            >
              Хаах
            </button>
          </div>

          <ul className="flex flex-col">
            <li className="border-b border-gray-50">
              <Link
                href="/products?clear=true"
                onClick={() => setIsCategoryOpen(false)}
                className="flex items-center justify-between p-5 hover:bg-gray-50"
              >
                <span className="font-bold text-gray-800">Бүх бүтээгдэхүүн</span>
                <ChevronDown className="w-4 h-4 -rotate-90 text-gray-300" />
              </Link>
            </li>

            {dbCategories.map((cat) => (
              <li key={cat.id} className="border-b border-gray-50">
                <Link
                  href={`/products?category=${cat.name}`}
                  onClick={() => setIsCategoryOpen(false)}
                  className="flex items-center justify-between p-5 hover:bg-gray-50 active:bg-gray-100 transition"
                >
                  <span className="text-base font-medium text-gray-700">{cat.name}</span>
                  <ChevronDown className="w-4 h-4 -rotate-90 text-gray-300" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 2. ДООД ҮНДСЭН NAV BAR */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-100 flex justify-around items-center py-2 px-2 z-[70] text-[10px] font-bold text-gray-400 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <Link
          href="/"
          onClick={() => setIsCategoryOpen(false)}
          className="flex flex-col items-center gap-1 w-16 transition-colors hover:text-black"
        >
          <Home className="w-6 h-6" />
          <span>Нүүр</span>
        </Link>

        <button
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className={`flex flex-col items-center gap-1 w-16 transition-all ${isCategoryOpen ? 'text-black scale-110' : 'hover:text-black'}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <line x1="3" y1="8" x2="16" y2="8" />
            <line x1="3" y1="15" x2="9" y2="15" />
            <circle cx="14" cy="14" r="3.5" />
            <line x1="16.5" y1="16.5" x2="19.5" y2="19.5" />
          </svg>
          <span>Ангилал</span>
        </button>

        <Link
          href="/sale"
          onClick={() => setIsCategoryOpen(false)}
          className="flex flex-col items-center gap-1 w-16 hover:text-black"
        >
          <Percent className="w-6 h-6" />
          <span>Хямдрал</span>
        </Link>

        {/* ӨӨРЧЛӨГДӨХ ХЭСЭГ: Хэрэв админ бол Админ хуудас руу, үгүй бол Профайл руу */}
        <Link
          href={profilePath}
          onClick={() => setIsCategoryOpen(false)}
          className={`flex flex-col items-center gap-1 w-16 transition-colors ${isAdmin ? "text-green-600" : "hover:text-black"}`}
        >
          {isAdmin ? (
            <>
              <LayoutDashboard className="w-6 h-6" />
              <span>Админ</span>
            </>
          ) : (
            <>
              <User className="w-6 h-6" />
              <span>Профайл</span>
            </>
          )}
        </Link>
      </nav>
    </>
  );
}