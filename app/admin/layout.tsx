"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Flower2, 
  FolderTree, 
  PlusCircle, 
  UserCircle,
  Home,
  Menu,
  X,
  ChevronRight
} from "lucide-react";

const menuItems = [
  { name: "Хянах самбар", path: "/admin", icon: <LayoutDashboard size={18} strokeWidth={1.5} /> },
  { name: "Захиалгууд", path: "/admin/orders", icon: <ShoppingBag size={18} strokeWidth={1.5} /> },
  { name: "Бүтээгдэхүүнүүд", path: "/admin/products", icon: <Flower2 size={18} strokeWidth={1.5} /> },
  { name: "Категориуд", path: "/admin/categories", icon: <FolderTree size={18} strokeWidth={1.5} /> },
  { name: "Шинэ цэцэг нэмэх", path: "/admin/products/add", icon: <PlusCircle size={18} strokeWidth={1.5} /> },
  { name: "Профайл", path: "/admin/profile", icon: <UserCircle size={18} strokeWidth={1.5} /> },
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
      <div className="h-screen w-full flex items-center justify-center bg-[#FCFBF9]">
        <div className="w-8 h-8 border-2 border-gray-100 border-t-[#1A1A1A] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthorized) return null;

  return (
    <div className="flex min-h-screen bg-[#FCFBF9] text-[#1A1A1A] relative font-montserrat">
      
      {/* Overlay: Sidebar нээлттэй үед арын хэсгийг бүрхэх (Mobile-д) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-black/[0.03] transition-transform duration-300 transform 
        lg:relative lg:translate-x-0 
        ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full justify-between">
          <div>
            <div className="h-20 flex items-center justify-between px-8 border-b border-gray-50">
              <h1 className="text-xl font-playfair font-medium tracking-tight text-[#1A1A1A]">Admin Panel</h1>
              {/* Хаах товч (Mobile-д) */}
              <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-[#1A1A1A]/30"><X size={20} /></button>
            </div>

            <nav className="p-6 space-y-2 mt-4">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center justify-between px-5 py-4 rounded-[2px] transition-all text-[10px] uppercase tracking-[0.2em] ${
                      isActive
                        ? "bg-[#1A1A1A] text-white shadow-xl shadow-black/10 font-medium"
                        : "text-[#1A1A1A]/60 hover:bg-[#FCFBF9]"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {item.icon}
                      <span>{item.name}</span>
                    </div>
                    {isActive && <ChevronRight size={12} />}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="p-6 border-t border-gray-50">
            <Link
              href="/"
              className="flex items-center gap-4 px-5 py-4 text-[#1A1A1A]/40 hover:text-[#1A1A1A] text-[10px] uppercase tracking-[0.2em] rounded-[2px] transition-colors"
            >
              <Home size={18} strokeWidth={1.5} />
              <span>Дэлгүүр рүү буцах</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Үндсэн хэсэг */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-20 bg-white border-b border-black/[0.03] flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Hamburger Menu Button */}
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 lg:hidden text-[#1A1A1A] hover:bg-gray-50 rounded-[2px]"
            >
              <Menu size={24} strokeWidth={1.5} />
            </button>
            <h2 className="text-lg md:text-xl font-playfair font-medium text-[#1A1A1A]">
              {menuItems.find(item => item.path === pathname)?.name || "Удирдлагын хэсэг"}
            </h2>
          </div>
        </header>

        {/* Content area */}
        <div className="flex-1 p-3 sm:p-4 lg:p-8 pb-24 lg:pb-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
      
    </div>
  );
}