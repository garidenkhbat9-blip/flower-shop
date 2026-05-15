"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Clock, CheckCircle2, Package, Printer, HelpCircle, Truck
} from "lucide-react";
import Link from "next/link";

export default function OrderPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(3600);

  // Real-time listener - хүргэлтийн ажилтан статус өөрчлөхөд хэрэглэгчийн хуудас дээр шууд шинэчлэгдэнэ
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "orders", id), (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setOrder(data);
      } else {
        router.push("/");
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to order:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, router]);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (sec: number) => ({
    h: Math.floor(sec / 3600),
    m: Math.floor((sec % 3600) / 60),
    s: sec % 60,
  });
  const { h, m, s } = formatTime(timeLeft);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!order) return null;

  const shipping = order.shippingInfo;
  const isPickup = shipping?.deliveryType === "pickup";
  const dateStr = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleString("mn-MN")
    : "Огноо тодорхойгүй";
  const shortId = order.id.substring(0, 8).toUpperCase();

  const fullAddress = isPickup
    ? "Төв дэлгүүр, Улаанбаатар галерей 2 давхар"
    : `${shipping?.city || ""}, ${shipping?.district || ""}, ${shipping?.khoroo || ""}, ${shipping?.building || ""} ${shipping?.apartmentNumber ? `Тоот: ${shipping.apartmentNumber}` : ""} ${shipping?.additionalInfo || ""}`;

  const stepDone = (n: number) => {
    if (n === 1) return true;
    if (n === 2) return order.paymentStatus === "Төлөгдсөн";
    if (n === 3) return order.status === "Хүргэлтэнд гарсан" || order.status === "Хүргэгдсэн";
    if (n === 4) return order.status === "Хүргэгдсэн";
    return false;
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111] pb-24 font-sans">
      <div className="max-w-[800px] mx-auto px-6 pt-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[12px] text-gray-500 mb-1">Захиалга</p>
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-black">#{shortId}</h1>
            {order.paymentStatus === "Төлөгдсөн" ? (
              <span className="bg-green-50 text-green-600 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>Амжилттай төлөгдсөн
              </span>
            ) : (
              <span className="bg-orange-50 text-orange-600 text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>Төлбөр хүлээгдэж буй
              </span>
            )}
          </div>
          <p className="text-[13px] text-gray-500 mt-2">{dateStr} · {order.items?.length || 0} бараа</p>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-6 shadow-sm">
          <div className="relative flex justify-between">
            <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-gray-100 -z-10"></div>
            {[
              { label: "Захиалсан", icon: <CheckCircle2 size={18} />, step: 1 },
              { label: "Төлсөн", icon: <CheckCircle2 size={18} />, step: 2 },
              { label: "Хүргэлтэнд", icon: <Truck size={18} />, step: 3 },
              { label: isPickup ? "Олгосон" : "Хүргэгдсэн", icon: <Package size={18} />, step: 4 },
            ].map((s) => (
              <div key={s.step} className="flex flex-col items-center gap-2 bg-white px-2">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                  stepDone(s.step) ? "border-[#e62060] bg-pink-50 text-[#e62060]" : "border-gray-100 bg-white text-gray-300"
                }`}>
                  {s.icon}
                </div>
                <p className={`text-[12px] font-bold ${stepDone(s.step) ? "text-[#111]" : "text-gray-400"}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Success Banner - Төлбөр төлөгдсөн, хүргэлт хүлээгдэж буй */}
        {order.paymentStatus === "Төлөгдсөн" && order.status !== "Хүргэлтэнд гарсан" && order.status !== "Хүргэгдсэн" && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-8 mb-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-green-200">
              {isPickup ? <Package size={32} strokeWidth={2.5} /> : <CheckCircle2 size={32} strokeWidth={2.5} />}
            </div>
            <h2 className="text-xl font-black text-green-900 mb-2">
              {isPickup ? "Таны баглааг бэлдсэн байна!" : "Захиалга баталгаажлаа!"}
            </h2>
            <p className="text-[14px] text-green-700 max-w-[400px] mb-6">
              {isPickup 
                ? "Та манай төв салбар дээр ирж захиалгаа авна уу. Бид таныг хүлээж байна." 
                : "Таны төлбөр амжилттай хүлээн авлаа. Хүргэлтийг удахгүй эхлүүлэх болно."}
            </p>
            <Link href="/products" className="bg-green-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-100">
              Үргэлжлүүлэн худалдан авах
            </Link>
          </div>
        )}

        {/* Хүргэлтэнд гарсан banner */}
        {order.status === "Хүргэлтэнд гарсан" && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-8 mb-6 flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-200 animate-pulse">
              <Truck size={32} strokeWidth={2.5} />
            </div>
            <h2 className="text-xl font-black text-blue-900 mb-2">Хүргэлт явагдаж байна</h2>
            <p className="text-[14px] text-blue-700 max-w-[400px]">Таны захиалга хүргэлтэнд гарсан. Удахгүй хүргэгдэх болно!</p>
          </div>
        )}

        {/* Төлбөр хүлээгдэж буй */}
        {order.paymentStatus !== "Төлөгдсөн" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 mb-6 flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Clock className="text-yellow-600 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-yellow-800 text-[15px]">Төлбөр хүлээгдэж байна</p>
                <p className="text-[12px] text-yellow-700 mt-1">Доорх дансруу шилжүүлэг хийж баталгаажуулна уу.</p>
              </div>
            </div>
            <div className="flex gap-2 text-yellow-800">
              {[{v:h,l:"цаг"},{v:m,l:"мин"},{v:s,l:"сек"}].map((t,i)=>(
                <div key={i} className="flex flex-col items-center bg-white px-3 py-1.5 rounded-lg border border-yellow-200 shadow-sm">
                  <span className={`font-black text-lg leading-none ${i===2?"text-[#e62060]":""}`}>{t.v.toString().padStart(2,"0")}</span>
                  <span className="text-[9px] uppercase tracking-wider mt-1">{t.l}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6 shadow-sm">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <Package size={16} className="text-gray-500" />
            <h2 className="text-[13px] font-bold text-gray-800">Захиалсан бараа ({order.items?.length || 0})</h2>
          </div>
          <div className="p-5 space-y-4">
            {order.items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex gap-4 items-center">
                  <img src={item.imageUrl} alt="" className="w-16 h-16 object-cover rounded-xl bg-gray-50" />
                  <div>
                    <p className="text-[13px] font-bold">{item.name}</p>
                    <p className="text-[11px] text-gray-400 mt-1">x {item.quantity} ш.</p>
                  </div>
                </div>
                <p className="text-[13px] font-bold">{item.price?.toLocaleString()}₮</p>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6 shadow-sm">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-gray-500" />
            <h2 className="text-[13px] font-bold text-gray-800">Захиалгын мэдээлэл</h2>
          </div>
          <div className="px-5">
            {[
              { label: "Илгээгч", value: shipping?.senderName },
              { label: "Утас", value: `${shipping?.senderPhone || ""} ${shipping?.senderPhoneAlt ? `· ${shipping.senderPhoneAlt}` : ""}` },
              { label: isPickup ? "Авах салбар" : "Хүргэлтийн хаяг", value: fullAddress },
              { label: "Хүлээн авагч", value: shipping?.recipientName },
              { label: "Хүлээн авагчийн утас", value: shipping?.recipientPhone },
              { label: "Хүргэх өдөр", value: shipping?.deliveryDate },
              ...(shipping?.cardMessage ? [{ label: "Мэндчилгээний үг", value: shipping.cardMessage }] : []),
              { label: "Төлбөрийн хэлбэр", value: "QPay" },
              { label: "Үүсгэсэн", value: dateStr },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4 py-4 border-b border-gray-50 last:border-0">
                <p className="text-[12px] text-gray-500">{row.label}</p>
                <p className="text-[13px] font-medium">{row.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Totals */}
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6 shadow-sm">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
            <span className="text-[11px] font-bold border border-gray-300 rounded px-1 text-gray-500">$</span>
            <h2 className="text-[13px] font-bold text-gray-800">Төлбөрийн задаргаа</h2>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex justify-between text-[13px] text-gray-500">
              <span>Барааны дүн</span>
              <span>{order.subTotal?.toLocaleString() || order.totalAmount?.toLocaleString()}₮</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between text-[13px] text-gray-500">
                <span>Хүргэлт</span><span>{order.deliveryFee?.toLocaleString()}₮</span>
              </div>
            )}
            <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
              <span className="text-[13px] font-bold">Нийт төлөх</span>
              <span className="text-xl font-black">{order.totalAmount?.toLocaleString()}₮</span>
            </div>
          </div>
        </div>

        {/* Хүргэгдсэн - амжилттай */}
        {order.status === "Хүргэгдсэн" && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-8 mb-6 text-center">
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-black text-green-900 mb-1">Хүргэлт амжилттай!</h3>
            <p className="text-[13px] text-green-700 mb-4">Таны захиалга амжилттай хүргэгдлээ.</p>
            {order.deliveryPhoto && (
              <img src={order.deliveryPhoto} alt="Хүргэлтийн зураг" className="w-full max-w-xs mx-auto rounded-2xl border border-green-200 shadow-sm mb-4" />
            )}
            <Link href="/products" className="inline-block bg-green-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-green-700 transition shadow-lg shadow-green-100">
              Үргэлжлүүлэн худалдан авах
            </Link>
          </div>
        )}

        {/* Print / Help */}
        <div className="flex justify-center gap-6 mt-10 no-print">
          <button onClick={() => window.print()} className="flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-black transition">
            <Printer size={16} /> Хэвлэх
          </button>
          <button className="flex items-center gap-2 text-[13px] font-medium text-gray-500 hover:text-black transition">
            <HelpCircle size={16} /> Тусламж
          </button>
        </div>
      </div>
    </div>
  );
}
