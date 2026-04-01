"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase"; // db нэмсэн
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore"; // onSnapshot нэмсэн
import { useRouter } from "next/navigation";
import { 
  User, Package, Heart, MapPin, Settings, LogOut, 
  Menu as MenuIcon, X, FileText 
} from "lucide-react";

import PersonalSection from "./_components/PersonalSection";
import OrdersSection from "./_components/OrdersSection";
import WishlistSection from "./_components/WishlistSection";
import PasswordSection from "./_components/PasswordSection";
import LogoutModal from "./_components/LogoutModal";

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("orders");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null); // Firestore-оос ирэх өгөгдөл

  useEffect(() => {
    let unsubscribeFirestore: any;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/auth/login?next=/profile");
      } else {
        setUser(currentUser);
        
        // Firestore-оос хэрэглэгчийн мэдээллийг (зураг гэх мэт) бодит хугацаанд сонсох
        unsubscribeFirestore = onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
          if (doc.exists()) {
            setUserData(doc.data());
          }
          setLoading(false);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeFirestore) unsubscribeFirestore();
    };
  }, [router]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
    </div>
  );

  const menuItems = [
    { id: "orders", label: "Захиалгууд", icon: <Package className="w-5 h-5" /> },
    { id: "wishlist", label: "Хүслийн жагсаалт", icon: <Heart className="w-5 h-5" /> },
    { id: "personal", label: "Миний мэдээлэл", icon: <MapPin className="w-5 h-5" /> },
  ];

  // Зургийг харуулах функц (Давтахгүйн тулд)
  const RenderAvatar = (size: string) => (
    <div className={`${size} bg-gradient-to-tr from-[#136a8a] to-[#f48b29] rounded-full overflow-hidden shadow-inner flex items-center justify-center bg-gray-100`}>
      {userData?.photoURL ? (
        <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <span className="text-white font-bold text-xl">
          {(userData?.firstName || user?.email)?.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-10">
      {/* MOBILE HEADER */}
      <div className="lg:hidden flex justify-end p-4 sticky top-0 bg-white/80 backdrop-blur-md z-30 border-b border-gray-100">
        <button onClick={() => setIsDrawerOpen(true)} className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
          <MenuIcon className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* COMPUTER SIDEBAR */}
          <aside className="hidden lg:block w-[320px] shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
              <div className="flex flex-col items-center text-center mb-8">
                {RenderAvatar("w-24 h-24 mb-4")} {/* Sidebar-ийн зураг */}
                <h2 className="text-lg font-bold text-gray-900">
                  {userData?.firstName ? `${userData.firstName} ${userData.lastName}` : "Хэрэглэгч"}
                </h2>
                <p className="text-sm text-gray-400 font-medium">{user?.email}</p>
              </div>

              <nav className="space-y-1 border-t border-gray-50 pt-6">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      activeTab === item.id ? "bg-[#FDF2F8] text-[#D81B60]" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}
                <button 
                  onClick={() => setShowLogoutModal(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-600 hover:bg-red-50 hover:text-red-500 transition-all mt-4"
                >
                  <LogOut className="w-5 h-5" />
                  Гарах
                </button>
              </nav>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm min-h-[600px] p-6 lg:p-10">
              <div className="mb-10">
                <h1 className="text-xl font-bold text-gray-900">
                  {menuItems.find(i => i.id === activeTab)?.label}
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  {activeTab === 'orders' && "Таны хийсэн хамгийн сүүлийн захиалгууд"}
                  {activeTab === 'personal' && "Өөрийн хувийн мэдээллийг засах"}
                </p>
              </div>

              <div className="w-full">
                {activeTab === "orders" && (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <FileText className="w-12 h-12 text-gray-900 mx-auto mb-4" strokeWidth={1.5} />
                    <p className="font-bold text-gray-900">Захиалга байхгүй байна.</p>
                    <p className="text-gray-400 text-sm mt-2">Таны хийсэн захиалгууд энд харагдах болно.</p>
                  </div>
                )}
                {activeTab === "personal" && <PersonalSection />}
                {activeTab === "wishlist" && <WishlistSection />}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* MOBILE DRAWER */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-6 flex justify-between items-center border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900">Профайл</h2>
              <button onClick={() => setIsDrawerOpen(false)}><X className="w-6 h-6 text-gray-400" /></button>
            </div>

            <div className="p-6 flex flex-col items-center text-center border-b border-gray-50">
              {RenderAvatar("w-20 h-20 mb-3")} {/* Mobile Drawer-ийн зураг */}
              <h3 className="font-bold text-gray-900">{userData?.firstName || "Хэрэглэгч"}</h3>
              <p className="text-xs text-gray-400">{user?.email}</p>
            </div>

            <nav className="p-4 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsDrawerOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === item.id ? "bg-[#FDF2F8] text-[#D81B60]" : "text-gray-700 active:bg-gray-50"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <button onClick={() => { setIsDrawerOpen(false); setShowLogoutModal(true); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 active:bg-red-50 mt-4">
                <LogOut className="w-5 h-5" />
                Гарах
              </button>
            </nav>
          </div>
        </div>
      )}

      {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} />}
    </div>
  );
}