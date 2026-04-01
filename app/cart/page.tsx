"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Plus, Minus, UserCircle2, LogIn, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal } = useCart();
  const { user, loading } = useAuth();

  // 1. Ачааллаж байх үед
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-white font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Мэдээлэл шалгаж байна...</p>
        </div>
      </div>
    );
  }

  // 2. Хэрэв нэвтрээгүй бол
  if (!user) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white px-6 text-center font-sans">
        <div className="w-24 h-24 bg-gray-50 text-gray-300 rounded-[40px] flex items-center justify-center mb-8">
          <UserCircle2 size={60} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Та нэвтрээгүй байна</h2>
        <p className="text-gray-500 max-w-xs mb-10 text-sm leading-relaxed font-medium">
          Сагсанд байгаа бараануудаа харахын тулд та эхлээд бүртгүүлж эсвэл нэвтэрч өөрийн ID-г баталгаажуулна уу.
        </p>
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <Link href="/auth/login" className="bg-black text-white py-5 rounded-[24px] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-gray-200">
            Нэвтрэх
          </Link>
          <Link href="/auth/register" className="text-gray-400 font-black uppercase text-[10px] tracking-widest hover:text-black transition">
            Бүртгүүлэх
          </Link>
        </div>
      </div>
    );
  }

  // 3. Хэрэв сагс хоосон бол
  if (cart.length === 0) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white px-6 text-center font-sans">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-200 mb-6">
           <ShoppingBag size={40} />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">Сагс хоосон байна</h2>
        <p className="text-gray-400 text-sm mb-10">Таны ID дээр ямар нэгэн бараа хадгалагдаагүй байна.</p>
        <Link href="/products" className="bg-black text-white px-12 py-5 rounded-[24px] font-black uppercase text-xs tracking-widest">
          Дэлгүүр хэсэх
        </Link>
      </div>
    );
  }

  // 4. Үндсэн сагс
  return (
    <div className="min-h-screen bg-[#FDFDFD] py-16 px-6 font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-black uppercase tracking-tighter italic mb-10">Миний сагс</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-8 space-y-6">
            {cart.map((item) => (
              <div key={item.id} className="bg-white p-6 flex gap-6 rounded-[32px] border border-gray-100 items-center">
                <img src={item.imageUrl} className="w-24 h-28 object-cover rounded-2xl" alt="" />
                <div className="flex-1">
                  <h3 className="font-black text-sm uppercase">{item.name}</h3>
                  <p className="font-black text-lg mt-1">{item.price.toLocaleString()} ₮</p>
                </div>
                <div className="flex items-center bg-gray-50 p-1.5 rounded-xl">
                   <button onClick={() => updateQuantity(item.id, -1)} className="p-2 bg-white rounded-lg shadow-sm font-bold">-</button>
                   <span className="px-6 font-black text-sm">{item.quantity}</span>
                   <button onClick={() => updateQuantity(item.id, 1)} className="p-2 bg-white rounded-lg shadow-sm font-bold">+</button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500"><Trash2 size={20}/></button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-4">
             <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-2xl shadow-gray-200/50 space-y-6">
                <div className="flex justify-between font-black uppercase text-xs tracking-widest text-gray-400">
                   <span>Нийт</span>
                   <span className="text-black text-xl tracking-tighter">{cartTotal.toLocaleString()} ₮</span>
                </div>
                <Link href="/checkout" className="block w-full bg-[#80B501] text-white text-center py-5 rounded-[24px] font-black uppercase text-xs tracking-widest shadow-lg shadow-green-100">
                   Захиалах
                </Link>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}