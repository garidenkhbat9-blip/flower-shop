"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase"; // db нэмсэн
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore"; // onSnapshot нэмсэн
import { useRouter } from "next/navigation";
import { 
  User, Package, Heart, MapPin, Settings, LogOut, 
  Menu as MenuIcon, X, FileText, ChevronRight 
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
    <div className="h-screen flex items-center justify-center bg-[#FCFBF9]">
      <div className="w-8 h-8 border-2 border-gray-100 border-t-[#87A96B] rounded-full animate-spin"></div>
    </div>
  );

  const menuItems = [
    { id: "orders", label: "Захиалгууд", icon: <Package className="w-5 h-5" strokeWidth={1.5} /> },
    { id: "wishlist", label: "Хүслийн жагсаалт", icon: <Heart className="w-5 h-5" strokeWidth={1.5} /> },
    { id: "personal", label: "Миний мэдээлэл", icon: <MapPin className="w-5 h-5" strokeWidth={1.5} /> },
  ];

  // Зургийг харуулах функц (Давтахгүйн тулд)
  const RenderAvatar = (size: string) => (
    <div className={`${size} bg-[#F3F2F0] rounded-full overflow-hidden border border-black/[0.03] flex items-center justify-center`}>
      {userData?.photoURL ? (
        <img src={userData.photoURL} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <span className="text-[#1A1A1A]/30 font-playfair italic text-xl">
          {(userData?.firstName || user?.email)?.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FCFBF9] pb-10 font-montserrat text-[#1A1A1A]">
      {/* MOBILE HEADER */}
      <div className="lg:hidden flex justify-end p-4 sticky top-0 bg-white/80 backdrop-blur-md z-30 border-b border-gray-100">
        <button onClick={() => setIsDrawerOpen(true)} className="p-2 bg-white rounded-[2px] shadow-sm border border-gray-100">
          <MenuIcon className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:py-12">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* COMPUTER SIDEBAR */}
          <aside className="hidden lg:block w-[300px] shrink-0">
            <div className="bg-white rounded-[2px] border border-black/[0.03] shadow-sm p-8 sticky top-24">
              <div className="flex flex-col items-center text-center mb-10">
                {RenderAvatar("w-20 h-20 mb-6")}
                <h2 className="text-xl font-playfair font-medium text-[#1A1A1A]">
                  {userData?.firstName ? `${userData.firstName} ${userData.lastName}` : "Хэрэглэгч"}
                </h2>
                <p className="text-[10px] text-[#1A1A1A]/40 font-light tracking-[0.2em] mt-2 lowercase">{user?.email}</p>
              </div>

              <nav className="space-y-1 border-t border-gray-50 pt-8">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-4 rounded-[2px] text-[10px] font-medium uppercase tracking-[0.3em] transition-all ${
                      activeTab === item.id ? "bg-[#87A96B] text-white shadow-xl shadow-[#87A96B]/20" : "text-[#1A1A1A]/40 hover:bg-[#FCFBF9]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      {item.label}
                    </div>
                    {activeTab === item.id && <ChevronRight size={14} />}
                  </button>
                ))}
                <div className="pt-6 mt-6 border-t border-gray-50">
                  <button 
                    onClick={() => setShowLogoutModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-4 rounded-[2px] text-[10px] font-medium uppercase tracking-[0.3em] text-[#1A1A1A]/40 hover:bg-red-50 hover:text-red-600 transition-all"
                  >
                    <LogOut className="w-5 h-5" strokeWidth={1.5} />
                    Гарах
                  </button>
                </div>
              </nav>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1">
            <div className="bg-white rounded-[2px] border border-black/[0.03] shadow-sm min-h-[600px] p-6 lg:p-12">
              <div className="mb-12 border-b border-gray-50 pb-12">
                <h1 className="text-2xl md:text-5xl font-playfair font-medium text-[#1A1A1A] tracking-tight leading-none">
                  {menuItems.find(i => i.id === activeTab)?.label}
                </h1>
                <p className="text-[10px] text-[#1A1A1A]/30 font-light tracking-[0.4em] uppercase mt-4">
                  {activeTab === 'orders' && "Таны хийсэн хамгийн сүүлийн захиалгууд"}
                  {activeTab === 'personal' && "Өөрийн хувийн мэдээллийг засах"}
                  {activeTab === 'wishlist' && "Таны хадгалсан цэцэгс"}
                </p>
              </div>

              <div className="w-full">
                {activeTab === "orders" && <OrdersSection />}
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
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" onClick={() => setIsDrawerOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[300px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
            <div className="p-8 flex justify-between items-center border-b border-gray-50">
              <h2 className="text-xl font-playfair font-medium text-[#1A1A1A]">Профайл</h2>
              <button onClick={() => setIsDrawerOpen(false)}><X className="w-6 h-6 text-[#1A1A1A]/30" /></button>
            </div>

            <div className="p-10 flex flex-col items-center text-center border-b border-gray-50">
              {RenderAvatar("w-20 h-20 mb-4")}
              <h3 className="font-playfair font-medium text-lg text-[#1A1A1A]">{userData?.firstName || "Хэрэглэгч"}</h3>
              <p className="text-[10px] text-[#1A1A1A]/40 font-light uppercase tracking-[0.2em] mt-2">{user?.email}</p>
            </div>

            <nav className="p-6 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setIsDrawerOpen(false); }}
                  className={`w-full flex items-center gap-4 px-6 py-5 rounded-[2px] text-[10px] font-medium uppercase tracking-[0.3em] transition-all ${
                    activeTab === item.id ? "bg-[#87A96B] text-white shadow-xl shadow-[#87A96B]/20" : "text-[#1A1A1A]/40 active:bg-[#FCFBF9]"
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <button onClick={() => { setIsDrawerOpen(false); setShowLogoutModal(true); }} className="w-full flex items-center gap-4 px-6 py-5 rounded-[2px] text-[10px] font-medium uppercase tracking-[0.3em] text-[#1A1A1A]/40 active:bg-red-50 mt-4">
                <LogOut className="w-5 h-5" strokeWidth={1.5} />
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