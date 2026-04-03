"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

const menuItems = [
  { name: "Хянах самбар", path: "/admin", icon: "📊" },
  { name: "Захиалгууд", path: "/admin/orders", icon: "📦" },
  { name: "Бүтээгдэхүүнүүд", path: "/admin/products", icon: "🌸" },
  { name: "Категориуд", path: "/admin/categories", icon: "📁" },
  { name: "Шинэ цэцэг нэмэх", path: "/admin/products/add", icon: "➕" },
  { name: "Профайл", path: "/admin/profile", icon: "👤" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar нээлттэй эсэх

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists() && userDoc.data().isAdmin === true) {
            setIsAuthorized(true);
          } else {
            router.push("/auth/login");
          }
        } catch (error) {
          router.push("/auth/login");
        }
      } else {
        router.push("/auth/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  // Хуудас солигдох үед Sidebar-ийг хаах (Mobile-д)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#FFFDF9]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E2A9BE]"></div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden text-gray-800 relative">
      
      {/* Overlay: Sidebar нээлттэй үед арын хэсгийг бүрхэх (Mobile-д) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transition-transform duration-300 transform 
        lg:relative lg:translate-x-0 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100">
              <h1 className="text-xl font-bold text-[#333333]">Admin Panel</h1>
              {/* Хаах товч (Mobile-д) */}
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-2xl">✕</button>
            </div>

            <nav className="p-4 space-y-1 mt-4">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? "bg-[#E2A9BE] text-white shadow-md font-semibold"
                        : "text-gray-600 hover:bg-[#FFFDF9] hover:text-[#E2A9BE]"
                    }`}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-100">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-3 text-gray-500 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors"
            >
              <span>🏠</span>
              <span>Дэлгүүр рүү буцах</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Үндсэн хэсэг */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 lg:hidden text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <span className="text-2xl">☰</span>
            </button>
            <h2 className="text-lg font-medium text-gray-700 truncate">
              {menuItems.find(item => item.path === pathname)?.name || "Удирдлагын хэсэг"}
            </h2>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      
    </div>
  );
}