"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronDown, CheckCircle2, Plus, Minus, Trash2, Truck, Store
} from "lucide-react";
import Link from "next/link";

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [formData, setFormData] = useState({
    senderName: "",
    senderEmail: "",
    senderPhone: "",
    senderPhoneAlt: "",
    recipientName: "",
    recipientPhone: "",
    deliveryDate: "",
    cardMessage: "",
    deliveryType: "delivery",
    addressType: "apartment",
    city: "Улаанбаатар",
    district: "",
    khoroo: "",
    building: "",
    apartmentNumber: "",
    street: "",
    floor: "",
    officeName: "",
    additionalInfo: ""
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, senderName: user.displayName || "", senderEmail: user.email || "" }));
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (cart.length === 0 && !orderSuccess) {
        router.push("/products");
      }
    }
  }, [user, authLoading, cart.length, router, orderSuccess]);

  if (authLoading || (cart.length === 0 && !orderSuccess)) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setLoading(true);
    try {
      const deliveryFee = formData.deliveryType === 'delivery' ? 8000 : 0;

      const orderData = {
        userId: user?.uid || "guest",
        items: cart,
        totalAmount: cartTotal + deliveryFee,
        subTotal: cartTotal,
        deliveryFee: deliveryFee,
        shippingInfo: formData,
        status: "Төлбөр төлөгдсөн",
        paymentStatus: "Төлөгдсөн",
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "orders"), orderData);
      setOrderSuccess(true);
      clearCart();
      router.push(`/order/${docRef.id}`);
    } catch (error) {
      console.error("Захиалга үүсгэхэд алдаа:", error);
      alert("Захиалга үүсгэхэд алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };



  const deliveryFee = formData.deliveryType === 'delivery' ? 8000 : 0;

  // Minimalist label & input classes
  const labelClass = "block text-[11px] font-medium text-gray-500 mb-1.5 uppercase tracking-wide";
  const inputClass = "w-full border-b border-gray-200 bg-transparent px-0 py-2 outline-none focus:border-black transition-colors text-[13px] text-[#111] placeholder-gray-300 rounded-none";

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111] pb-24 pt-8 font-sans">
      <div className="max-w-[1000px] mx-auto px-6">

        <div className="flex items-center gap-4 mb-10">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-black transition">
            <ChevronLeft size={24} strokeWidth={1.5} />
          </button>
          <h1 className="text-xl font-medium tracking-tight">Захиалга баталгаажуулах</h1>
        </div>

        <form onSubmit={handleOrder} className="flex flex-col lg:flex-row gap-16 lg:gap-24">

          {/* LEFT COLUMN - FORM */}
          <div className="flex-1 space-y-12">

            {/* Хэсэг 1: Илгээгч */}
            <section>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Нэр</label>
                  <input name="senderName" value={formData.senderName} onChange={handleChange} placeholder="Таны нэр" className={inputClass} required />
                </div>

                <div>
                  <label className={labelClass}>Имэйл хаяг</label>
                  <input name="senderEmail" type="email" value={formData.senderEmail} onChange={handleChange} placeholder="example@shop.mn" className={inputClass} />
                  <p className="text-[10px] text-gray-400 mt-1.5">Имэйл хаягийг заавал бөглөх шаардлагагүй.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Утасны дугаар *</label>
                    <input name="senderPhone" type="tel" value={formData.senderPhone} onChange={handleChange} placeholder="00000000" className={inputClass} required />
                  </div>
                  <div>
                    <label className={labelClass}>Нэмэлт утасны дугаар</label>
                    <input name="senderPhoneAlt" type="tel" value={formData.senderPhoneAlt} onChange={handleChange} placeholder="00000000" className={inputClass} />
                  </div>
                </div>
              </div>
            </section>

            {/* Хэсэг 2: Захиалгын нэмэлт мэдээлэл */}
            <section>
              <h2 className="text-[13px] font-medium mb-6 tracking-wide border-b border-gray-100 pb-2">Хүлээн авагчийн мэдээлэл</h2>
              <div className="space-y-5">
                <div>
                  <label className={labelClass}>Хүлээн авагчийн нэр *</label>
                  <input name="recipientName" value={formData.recipientName} onChange={handleChange} placeholder="Нэр оруулна уу" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Хүлээн авагчийн утас *</label>
                  <input name="recipientPhone" type="tel" value={formData.recipientPhone} onChange={handleChange} placeholder="Утасны дугаар" className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>Хүргэх өдөр *</label>
                  <input name="deliveryDate" type="date" value={formData.deliveryDate} onChange={handleChange} className={`${inputClass} cursor-pointer min-h-[36px]`} style={{ colorScheme: "light" }} required />
                </div>
                <div>
                  <label className={labelClass}>Мэндчилгээний үг</label>
                  <textarea name="cardMessage" value={formData.cardMessage} onChange={handleChange} placeholder="Картан дээр бичих үг..." className={`${inputClass} min-h-[60px] resize-none pt-2`} />
                </div>
              </div>
            </section>

            {/* Хэсэг 3: Хүргэлтийн төрөл */}
            <section>
              <h2 className="text-[13px] font-medium mb-6 tracking-wide border-b border-gray-100 pb-2">Хүргэлтийн төрөл</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => setFormData({ ...formData, deliveryType: "delivery" })}
                  className={`border rounded-xl p-4 cursor-pointer transition-all flex justify-between items-start ${formData.deliveryType === 'delivery' ? 'border-black bg-white shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-transparent'}`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Truck size={14} className={formData.deliveryType === 'delivery' ? 'text-black' : 'text-gray-400'} />
                      <span className={`text-[13px] ${formData.deliveryType === 'delivery' ? 'font-medium text-black' : 'text-gray-500'}`}>Хүргэлтээр авах</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Улаанбаатар хот дотор</p>
                    <p className="text-[11px] text-black font-medium mt-1">8,000₮</p>
                  </div>
                  {formData.deliveryType === 'delivery' && <CheckCircle2 size={16} strokeWidth={1.5} className="text-black" />}
                </div>

                <div
                  onClick={() => setFormData({ ...formData, deliveryType: "pickup" })}
                  className={`border rounded-xl p-4 cursor-pointer transition-all flex justify-between items-start ${formData.deliveryType === 'pickup' ? 'border-black bg-white shadow-sm' : 'border-gray-200 hover:border-gray-300 bg-transparent'}`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Store size={14} className={formData.deliveryType === 'pickup' ? 'text-black' : 'text-gray-400'} />
                      <span className={`text-[13px] ${formData.deliveryType === 'pickup' ? 'font-medium text-black' : 'text-gray-500'}`}>Очиж авах</span>
                    </div>
                    <p className="text-[11px] text-gray-400">Салбар дээрээс авах</p>
                    <p className="text-[11px] text-black font-medium mt-1">0₮</p>
                  </div>
                  {formData.deliveryType === 'pickup' && <CheckCircle2 size={16} strokeWidth={1.5} className="text-black" />}
                </div>
              </div>
            </section>

            {/* Хэсэг 4: Хаяг */}
            {formData.deliveryType === "delivery" ? (
              <section className="animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-[13px] font-medium mb-6 tracking-wide border-b border-gray-100 pb-2">Хүргэлтийн хаяг</h2>
                <div className="bg-gray-100/50 p-1 rounded-lg flex gap-1 mb-6">
                  {['apartment', 'house', 'office'].map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, addressType: type })}
                      className={`flex-1 py-1.5 text-[11px] rounded-md transition-all ${formData.addressType === type ? 'bg-white shadow-sm text-black font-medium' : 'text-gray-500 hover:text-black'}`}
                    >
                      {type === 'apartment' ? 'Орон сууц' : type === 'house' ? 'Хашаа байшин' : 'Оффис'}
                    </button>
                  ))}
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className={labelClass}>Хот / Аймаг *</label>
                      <div className="relative">
                        <select name="city" value={formData.city} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`} required>
                          <option value="Улаанбаатар">Улаанбаатар</option>
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Дүүрэг / Сум *</label>
                      <div className="relative">
                        <select name="district" value={formData.district} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`} required>
                          <option value="">Сонгох...</option>
                          <option value="Баянгол">Баянгол</option>
                          <option value="Баянзүрх">Баянзүрх</option>
                          <option value="Сүхбаатар">Сүхбаатар</option>
                          <option value="Сонгинохайрхан">Сонгинохайрхан</option>
                          <option value="Хан-Уул">Хан-Уул</option>
                          <option value="Чингэлтэй">Чингэлтэй</option>
                        </select>
                        <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>Хороо / Баг *</label>
                    <div className="relative">
                      <select name="khoroo" value={formData.khoroo} onChange={handleChange} className={`${inputClass} appearance-none cursor-pointer`} required>
                        <option value="">Сонгох...</option>
                        {Array.from({ length: 25 }, (_, i) => i + 1).map(num => (
                          <option key={num} value={`${num}-р хороо`}>{num}-р хороо</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                    </div>
                  </div>

                  {formData.addressType === 'apartment' && (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Байр *</label>
                        <input name="building" value={formData.building} onChange={handleChange} placeholder="Байрны дугаар" className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Тоот *</label>
                        <input name="apartmentNumber" value={formData.apartmentNumber} onChange={handleChange} placeholder="Хаалганы тоот" className={inputClass} required />
                      </div>
                    </div>
                  )}

                  {formData.addressType === 'house' && (
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <label className={labelClass}>Хашааны дугаар *</label>
                        <input name="building" value={formData.building} onChange={handleChange} placeholder="Хашааны дугаар" className={inputClass} required />
                      </div>
                      <div>
                        <label className={labelClass}>Гудамж</label>
                        <input name="street" value={formData.street} onChange={handleChange} placeholder="Гудамжны нэр" className={inputClass} />
                      </div>
                    </div>
                  )}

                  {formData.addressType === 'office' && (
                    <>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Барилга *</label>
                          <input name="building" value={formData.building} onChange={handleChange} placeholder="Барилгын нэр/дугаар" className={inputClass} required />
                        </div>
                        <div>
                          <label className={labelClass}>Давхар *</label>
                          <input name="floor" value={formData.floor} onChange={handleChange} placeholder="Давхар" className={inputClass} required />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className={labelClass}>Тоот *</label>
                          <input name="apartmentNumber" value={formData.apartmentNumber} onChange={handleChange} placeholder="Тоот" className={inputClass} required />
                        </div>
                        <div>
                          <label className={labelClass}>Оффисын нэр</label>
                          <input name="officeName" value={formData.officeName} onChange={handleChange} placeholder="Оффисын нэр" className={inputClass} />
                        </div>
                      </div>
                    </>
                  )}

                  <div>
                    <label className={labelClass}>Нэмэлт мэдээлэл</label>
                    <input name="additionalInfo" value={formData.additionalInfo} onChange={handleChange} placeholder="Орц, давхар, код гэх мэт" className={inputClass} />
                  </div>
                </div>
              </section>
            ) : (
              <section className="animate-in fade-in slide-in-from-bottom-2">
                <h2 className="text-[13px] font-medium mb-6 tracking-wide border-b border-gray-100 pb-2">Салбарын хаяг</h2>
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-[13px] text-[#111]">Төв дэлгүүр</span>
                      <span className="ml-2 bg-black text-white text-[9px] px-1.5 py-0.5 rounded uppercase tracking-widest">Үндсэн</span>
                    </div>
                  </div>
                  <p className="text-[12px] text-gray-500">Улаанбаатар галерей 2 давхар</p>
                </div>
              </section>
            )}

            {/* Хэсэг 5: Төлбөрийн сонголт */}
            <section>
              <h2 className="text-[13px] font-medium mb-6 tracking-wide border-b border-gray-100 pb-2">Төлбөрийн сонголт</h2>
              <div className="border border-black bg-white rounded-xl p-4 flex justify-between items-center cursor-default shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="font-medium text-[#003B6D] text-[13px]">Q<span className="text-[#0089D0]">Pay</span></div>
                  <div>
                    <p className="text-[12px] text-gray-500">Бүх банкны аппликэйшн</p>
                  </div>
                </div>
                <CheckCircle2 size={16} strokeWidth={1.5} className="text-black" />
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN - ORDER SUMMARY */}
          <div className="w-full lg:w-[320px]">
            <div className="sticky top-28">

              <h2 className="text-[13px] font-medium mb-6 tracking-wide border-b border-gray-100 pb-2">Таны сагс</h2>

              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 pb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start relative group">
                    <div className="relative shrink-0">
                      <img src={item.imageUrl} className="w-14 h-16 object-cover bg-gray-50" alt="" />
                      <button type="button" onClick={() => removeFromCart(item.id)} className="absolute -top-1.5 -left-1.5 bg-white text-gray-400 p-0.5 rounded-full shadow-sm border border-gray-100 hover:text-red-500 transition scale-0 group-hover:scale-100">
                        <Trash2 size={10} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0 pt-1">
                      <p className="text-[12px] font-medium truncate mb-1">{item.name}</p>
                      <p className="text-[12px] text-gray-500 mb-2">{item.price.toLocaleString()}₮</p>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => updateQuantity(item.id, -1)} className="text-gray-400 hover:text-black"><Minus size={10} /></button>
                        <span className="text-[11px] w-2 text-center text-gray-600">{item.quantity}</span>
                        <button type="button" onClick={() => updateQuantity(item.id, 1)} className="text-gray-400 hover:text-black"><Plus size={10} /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-gray-100 space-y-3">
                <div className="flex justify-between text-[12px] text-gray-500">
                  <span>Үнийн дүн</span>
                  <span>{cartTotal.toLocaleString()}₮</span>
                </div>
                <div className="flex justify-between text-[12px] text-gray-500">
                  <span>Хүргэлт</span>
                  <span>{deliveryFee === 0 ? '0₮' : `${deliveryFee.toLocaleString()}₮`}</span>
                </div>
                <div className="pt-3 mt-1 flex justify-between items-center">
                  <span className="text-[13px] font-medium">Нийт дүн</span>
                  <span className="text-lg font-medium">{(cartTotal + deliveryFee).toLocaleString()}₮</span>
                </div>
              </div>

              <div className="pt-8">
                <label className="flex items-start gap-3 cursor-pointer mb-6 group">
                  <div className="relative flex items-center justify-center shrink-0 mt-0.5">
                    <input
                      type="checkbox"
                      checked={agreedTerms}
                      onChange={(e) => setAgreedTerms(e.target.checked)}
                      className="peer appearance-none w-3.5 h-3.5 border border-gray-300 checked:border-black checked:bg-black transition-colors cursor-pointer rounded-sm"
                    />
                    <CheckCircle2 size={10} strokeWidth={2} className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Би Grow room-ийн <span className="text-[#111]">үйлчилгээний нөхцөл</span>-ийг зөвшөөрч байна.
                  </p>
                </label>

                <button
                  type="submit"
                  disabled={loading || cart.length === 0 || !agreedTerms}
                  className="w-full bg-[#111] text-white py-3.5 text-[11px] uppercase tracking-widest transition-all active:scale-95 disabled:bg-gray-100 disabled:text-gray-300 hover:bg-black"
                >
                  {loading ? "Түр хүлээнэ үү..." : "ТӨЛӨХ"}
                </button>

                <div className="text-center mt-5">
                  <Link href="/products" className="text-[11px] text-gray-400 hover:text-black transition-colors inline-flex items-center gap-1 uppercase tracking-widest">
                    Дахин бүтээгдэхүүн нэмэх
                  </Link>
                </div>
              </div>

            </div>
          </div>

        </form>
      </div>
    </div>
  );
}