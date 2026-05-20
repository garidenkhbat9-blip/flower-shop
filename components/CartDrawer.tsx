"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { X, ShoppingBag, LogIn, ChevronRight, Minus, Plus, Trash2 } from "lucide-react";
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
        className={`fixed inset-0 bg-black/40 backdrop-blur-md z-[100] transition-opacity duration-700 ${
          isCartOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* 2. Side Drawer */}
      <aside className={`fixed top-0 right-0 h-full bg-white z-[101] shadow-[0_0_100px_rgba(0,0,0,0.1)] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] transform 
        w-full md:w-[480px] border-l border-black/[0.03] flex flex-col ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}>
        
        {/* Header */}
        <div className="p-8 md:p-12 pb-6 flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-1">
             <span className="text-[10px] font-light tracking-[0.5em] text-[#999] uppercase font-montserrat">Таны сонголт</span>
             <h2 className="text-3xl md:text-4xl font-playfair font-medium text-[#111] tracking-tight">Сагс</h2>
          </div>
          <button 
            onClick={() => setIsCartOpen(false)} 
            className="group w-12 h-12 flex items-center justify-center rounded-full border border-black/[0.05] hover:bg-[#111] hover:border-[#111] transition-all duration-500"
          >
            <X size={18} className="text-[#111] group-hover:text-white transition-colors" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 md:px-12 py-4 custom-scrollbar">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-8 h-8 border-[2px] border-gray-100 border-t-[#111] rounded-full animate-spin" />
            </div>
          ) : cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
               <div className="w-24 h-24 bg-[#FAFAFA] rounded-full flex items-center justify-center mb-8 border border-black/[0.03]">
                 <ShoppingBag size={28} className="text-[#111]/20" />
               </div>
               <p className="text-[#999] font-medium uppercase text-[10px] tracking-[0.3em] font-montserrat mb-8">Таны сагс хоосон байна</p>
               <Link 
                 href="/products"
                 onClick={() => setIsCartOpen(false)}
                 className="text-[11px] font-bold uppercase tracking-[0.2em] border-b border-[#111] pb-2 hover:opacity-50 transition-opacity"
               >
                 Дэлгүүр хэсэх
               </Link>
            </div>
          ) : (
            <div className="space-y-12 mt-4 pb-12">
              {cart.map((item) => (
                <div key={item.id} className="flex gap-6 relative group">
                  {/* Барааны зураг */}
                  <div className="w-24 h-32 bg-[#FAFAFA] rounded-[2px] overflow-hidden shrink-0 border border-black/[0.03] relative">
                    <img src={item.imageUrl} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" alt="" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-700" />
                  </div>

                  {/* Мэдээлэл */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-[14px] font-medium text-[#111] leading-tight font-montserrat uppercase tracking-wider">{item.name}</h3>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-[#999] hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <p className="text-[10px] text-[#999] font-medium uppercase tracking-[0.1em] font-montserrat">{item.packaging}</p>
                    </div>
                    
                    <div className="flex items-end justify-between">
                      <div className="flex items-center border border-black/[0.08] rounded-[2px] h-10">
                         <button 
                           onClick={() => updateQuantity(item.id, -1)} 
                           className="w-10 h-full flex items-center justify-center text-[#111] hover:bg-[#FAFAFA] transition-colors text-sm"
                         >-</button>
                         <span className="w-8 text-center text-[11px] font-bold text-[#111] font-montserrat">{item.quantity}</span>
                         <button 
                           onClick={() => updateQuantity(item.id, 1)} 
                           className="w-10 h-full flex items-center justify-center text-[#111] hover:bg-[#FAFAFA] transition-colors text-sm"
                         >+</button>
                      </div>
                      <p className="text-sm font-medium text-[#111] font-montserrat">{(item.price * item.quantity).toLocaleString()}₮</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div className="p-8 md:p-12 bg-white border-t border-black/[0.05] space-y-8 shrink-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-medium text-[#999] uppercase tracking-[0.3em] font-montserrat">Нийт дүн</span>
                 <span className="text-xl font-medium text-[#111] font-montserrat">{cartTotal.toLocaleString()}₮</span>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[10px] font-medium text-[#999] uppercase tracking-[0.3em] font-montserrat">Хүргэлт</span>
                 <span className="text-[10px] font-bold text-[#111] uppercase tracking-[0.1em] font-montserrat">Төлбөр төлөх хэсэгт бодогдоно</span>
              </div>
            </div>

            <Link 
              href="/checkout" 
              onClick={() => setIsCartOpen(false)}
              className="group relative w-full bg-[#87A96B] text-white py-6 rounded-[2px] font-medium uppercase text-[11px] tracking-[0.4em] flex items-center justify-center gap-4 hover:bg-[#76945d] transition-all active:scale-[0.98] shadow-2xl"
            >
              Худалдан авах
              <div className="w-6 h-6 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-[#87A96B] transition-all">
                <ChevronRight size={12} />
              </div>
            </Link>
          </div>
        )}
      </aside>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </>
  );
}