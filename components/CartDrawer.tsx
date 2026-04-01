"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { X, ShoppingBag, LogIn, ChevronRight, Minus, Plus, Trash2 } from "lucide-react"; // Trash2 нэмэв
import Link from "next/link";
import { useEffect } from "react";

export default function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (isCartOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
  }, [isCartOpen]);

  return (
    <>
      {/* 1. Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-[100] transition-opacity duration-500 ${
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* 2. Side Drawer */}
      <aside className={`fixed top-0 right-0 h-full bg-white z-[101] shadow-2xl transition-transform duration-500 ease-in-out transform 
        w-[85vw] md:w-[420px] rounded-l-[40px] flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        
        {/* Header */}
        <div className="p-6 pt-10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center border border-gray-100">
                <ShoppingBag size={20} className="text-black" />
             </div>
             <h2 className="text-xl font-black uppercase tracking-tighter italic text-gray-200">САГС</h2>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2.5 bg-gray-50 rounded-full text-gray-400">
            <X size={20}/>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center"><div className="w-6 h-6 border-2 border-t-black rounded-full animate-spin"/></div>
          ) : !user ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
               <LogIn size={40} className="text-gray-200 mb-4" />
               <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Нэвтрэх</h3>
               <p className="text-gray-400 text-xs mb-8">Сагсаа ашиглахын тулд нэвтэрнэ үү.</p>
               <Link href="/auth/login" onClick={() => setIsCartOpen(false)} className="w-full bg-black text-white py-4 rounded-[20px] font-black uppercase text-xs flex items-center justify-center gap-2">
                 Нэвтрэх <ChevronRight size={14}/>
               </Link>
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
               <ShoppingBag size={48} className="text-gray-100 mb-4" />
               <p className="text-gray-400 font-bold uppercase text-[10px]">Сагс хоосон</p>
            </div>
          ) : (
            <div className="space-y-8 mt-4">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-4 items-center relative group animate-in fade-in slide-in-from-right-4">
                  {/* Барааны зураг */}
                  <div className="w-20 h-24 bg-gray-50 rounded-2xl overflow-hidden shrink-0 border border-gray-100">
                    <img src={item.imageUrl} className="w-full h-full object-cover" alt="" />
                  </div>

                  {/* Мэдээлэл */}
                  <div className="flex-1 flex flex-col justify-between pr-6">
                    <div>
                      <h3 className="text-[13px] font-black uppercase tracking-tight text-gray-800 line-clamp-1">{item.name}</h3>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">{item.packaging}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center bg-gray-50 rounded-xl px-1 py-1 border border-gray-100">
                         <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-xs">-</button>
                         <span className="px-3 text-xs font-black text-gray-300">{item.quantity}</span>
                         <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center bg-white rounded-lg shadow-sm text-xs">+</button>
                      </div>
                      <p className="text-sm font-black text-black">{item.price.toLocaleString()}₮</p>
                    </div>
                  </div>

                  {/* ✅ УСТГАХ ТОВЧ (Баруун дээд буланд) */}
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    className="absolute top-0 right-0 p-1.5 text-gray-200 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                    title="Устгах"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {user && cart.length > 0 && (
          <div className="p-8 bg-white space-y-6 shrink-0 rounded-tl-[40px] shadow-[0_-20px_40px_rgba(0,0,0,0.02)] border-t border-gray-50">
            <div className="flex justify-between items-end px-2">
               <span className="text-[11px] font-black text-gray-300 uppercase tracking-widest">НИЙТ ДҮН</span>
               <span className="text-2xl font-black tracking-tighter text-gray-200">{cartTotal.toLocaleString()}₮</span>
            </div>
            <Link 
              href="/checkout" 
              onClick={() => setIsCartOpen(false)}
              className="w-full bg-[#8BB711] text-white text-center py-5 rounded-[22px] font-black uppercase text-xs tracking-widest shadow-lg shadow-green-100 active:scale-95 flex items-center justify-center"
            >
              ЗАХИАЛГА ХИЙХ
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}