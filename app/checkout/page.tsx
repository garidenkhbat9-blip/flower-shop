"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, User, Phone, MessageSquare, CreditCard, 
  CheckCircle2, Heart, Plus, Minus, Trash2 
} from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  // 1. БҮХ HOOK-УУДЫГ ХАМГИЙН ДЭЭР ЗАРЛАНА (Дүрмийн дагуу)
  const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [formData, setFormData] = useState({
    senderName: "",
    senderPhone: "",
    recipientName: "",
    recipientPhone: "",
    deliveryAddress: "",
    deliveryDate: "",
    cardMessage: "",
  });

  // Хэрэглэгчийн нэрийг default утгаар оноох
  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, senderName: user.displayName || "" }));
    }
  }, [user]);

  // Хамгаалалтын логик
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/auth/login");
      } else if (cart.length === 0 && !orderSuccess) {
        router.push("/products");
      }
    }
  }, [user, authLoading, cart.length, router, orderSuccess]);

  // 2. НӨХЦӨЛТ RETURN-ҮҮД (Hook-уудын ард байх ёстой)
  if (authLoading || !user || (cart.length === 0 && !orderSuccess)) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const orderData = {
        userId: user.uid,
        items: cart,
        totalAmount: cartTotal,
        shippingInfo: formData,
        status: "Хүлээгдэж буй",
        paymentStatus: "Төлөөгүй",
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "orders"), orderData);
      clearCart();
      setOrderSuccess(true);
      
      setTimeout(() => {
        router.push("/");
      }, 5000);
    } catch (error) {
      console.error("Алдаа:", error);
      alert("Алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white px-6 text-center">
        <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={60} />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2">Захиалга амжилттай!</h1>
        <p className="text-gray-500 max-w-sm mb-8">Захиалгыг хүлээн авлаа. Төлбөр баталгаажсаны дараа хүргэгдэнэ.</p>
        <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100 w-full max-w-md text-left">
           <p className="text-sm font-bold text-gray-800">Хаан Банк: <span className="text-blue-600 font-black">5000123456</span></p>
           <p className="text-sm font-bold text-gray-800">Хүлээн авагч: <span className="font-black italic underline">Unur Flowers</span></p>
           <p className="text-xs text-rose-500 mt-3">* Гүйлгээний утга дээр утасны дугаараа бичээрэй.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#333333] pb-24 pt-10 font-sans">
      <div className="max-w-6xl mx-auto px-6">
        
        <div className="flex items-center gap-4 mb-10">
           <button onClick={() => router.back()} className="p-2 bg-white rounded-full border shadow-sm"><ChevronLeft size={24}/></button>
           <h1 className="text-3xl font-black uppercase tracking-tighter italic">Баталгаажуулах</h1>
        </div>

        <form onSubmit={handleOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
               <h2 className="font-black uppercase text-sm tracking-widest mb-6 flex items-center gap-2"><User size={18}/> Илгээгч</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Таны нэр" name="senderName" value={formData.senderName} onChange={handleChange} required />
                  <InputField label="Таны утас" name="senderPhone" value={formData.senderPhone} onChange={handleChange} required type="tel" />
               </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
               <h2 className="font-black uppercase text-sm tracking-widest mb-6 flex items-center gap-2"><Heart size={18} className="text-rose-500"/> Хүлээн авагч</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <InputField label="Нэр" name="recipientName" value={formData.recipientName} onChange={handleChange} required />
                  <InputField label="Утас" name="recipientPhone" value={formData.recipientPhone} onChange={handleChange} required type="tel" />
               </div>
               <InputField label="Хүргэлтийн хаяг" name="deliveryAddress" value={formData.deliveryAddress} onChange={handleChange} required />
               <div className="mt-4">
                 <InputField label="Хүргүүлэх огноо, цаг" name="deliveryDate" value={formData.deliveryDate} onChange={handleChange} required placeholder="Маргааш 14:00" />
               </div>
            </div>

            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-gray-100">
               <h2 className="font-black uppercase text-sm tracking-widest mb-4 flex items-center gap-2"><MessageSquare size={18}/> Мэндчилгээ</h2>
               <textarea name="cardMessage" value={formData.cardMessage} onChange={handleChange} placeholder="Картан дээр бичих үг..." className="w-full bg-white border border-gray-100 rounded-3xl p-5 min-h-[120px] focus:ring-2 focus:ring-[#87A96B] outline-none text-[#333333]" />
            </div>
          </div>

          <div className="lg:col-span-5">
             <div className="bg-white p-8 rounded-[40px] shadow-2xl border border-gray-100 sticky top-32 space-y-6">
                <h2 className="font-black uppercase text-sm tracking-widest border-b pb-4">Захиалгын хураангуй</h2>
                
                {/* БАРАА ЗАСАХ ХЭСЭГ */}
                <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 items-center bg-gray-50/50 p-3 rounded-2xl border border-gray-50 relative group">
                       <img src={item.imageUrl} className="w-16 h-20 object-cover rounded-xl shadow-sm" alt="" />
                       <div className="flex-1 min-w-0">
                          <p className="text-xs font-black uppercase truncate">{item.name}</p>
                          <p className="text-[14px] font-black mt-1">{item.price.toLocaleString()}₮</p>
                          
                          {/* Нэмэх хасах товчлуурууд */}
                          <div className="flex items-center gap-3 mt-2">
                             <div className="flex items-center bg-white border border-gray-100 rounded-lg p-1">
                                <button type="button" onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Minus size={14}/></button>
                                <span className="px-3 text-xs font-bold">{item.quantity}</span>
                                <button type="button" onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-gray-100 rounded text-gray-500"><Plus size={14}/></button>
                             </div>
                             <button type="button" onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                          </div>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-dashed space-y-2">
                   <div className="flex justify-between text-gray-400 text-xs font-bold uppercase">
                      <span>Барааны дүн</span>
                      <span>{cartTotal.toLocaleString()} ₮</span>
                   </div>
                   <div className="flex justify-between text-gray-400 text-xs font-bold uppercase font-black">
                      <span>Нийт</span>
                      <span className="text-[#333333] text-xl">{(cartTotal + 5000).toLocaleString()} ₮</span>
                   </div>
                </div>

                <button type="submit" disabled={loading || cart.length === 0} className="w-full bg-[#E2A9BE] text-[#FFFDF9] font-black py-5 rounded-[24px] uppercase text-xs tracking-widest hover:bg-[#d89bb1] transition active:scale-95 disabled:bg-gray-200 disabled:text-gray-400 flex items-center justify-center gap-2 shadow-xl shadow-[#E2A9BE]/20">
                  {loading ? "Түр хүлээнэ үү..." : <>ЗАХИАЛГА БАТАЛГААЖУУЛАХ <CreditCard size={18}/></>}
                </button>
             </div>
          </div>

        </form>
      </div>
    </div>
  );
}

function InputField({ label, ...props }: any) {
  return (
    <div className="space-y-1 w-full">
      <label className="text-[10px] font-black text-[#87A96B] uppercase ml-2 tracking-widest">{label}</label>
      <input className="w-full bg-white border border-gray-100 rounded-2xl p-4 focus:ring-2 focus:ring-[#87A96B] transition-all outline-none text-sm font-bold text-[#333333] placeholder-gray-400" {...props} />
    </div>
  );
}