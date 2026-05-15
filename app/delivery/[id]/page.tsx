"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useAuth } from "@/context/AuthContext";
import {
  CheckCircle2, Package, Truck,
  ChevronLeft, MapPin, Phone, Calendar, Camera,
  Play, X, AlertTriangle, Navigation, Clock, User, MessageSquare
} from "lucide-react";

export default function DeliveryDetailPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { userProfile, loading: authLoading } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Delivery driver states
  const [deliveryStarted, setDeliveryStarted] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const confirmSectionRef = useRef<HTMLDivElement>(null);

  const isDriver = userProfile?.role === "delivery" || userProfile?.role === "admin" || userProfile?.isAdmin;

  // Auth шалгалт
  useEffect(() => {
    if (authLoading) return;
    if (!userProfile || !isDriver) {
      router.push("/");
    }
  }, [userProfile, authLoading, isDriver, router]);

  // Real-time listener
  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, "orders", id), (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        setOrder(data);
        if ((data as any).status === "Хүргэлтэнд гарсан") setDeliveryStarted(true);
      } else {
        router.push("/delivery");
      }
      setLoading(false);
    }, (error) => {
      console.error("Error listening to order:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [id, router]);

  const handleStartDelivery = async () => {
    try {
      await updateDoc(doc(db, "orders", id), {
        status: "Хүргэлтэнд гарсан",
        deliveryStartedAt: serverTimestamp(),
      });
      setDeliveryStarted(true);
      setTimeout(() => {
        confirmSectionRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    } catch (err) {
      alert("Алдаа гарлаа. Дахин оролдоно уу.");
    }
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleConfirmDelivery = async () => {
    if (!photoFile) return alert("Зураг оруулна уу!");
    setUploading(true);
    try {
      const storageRef = ref(storage, `delivery-photos/${id}_${Date.now()}.jpg`);
      await uploadBytes(storageRef, photoFile);
      const photoURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "orders", id), {
        status: "Хүргэгдсэн",
        deliveryPhoto: photoURL,
        deliveredAt: serverTimestamp(),
      });
      setShowConfirmModal(false);
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      console.error(err);
      alert("Алдаа гарлаа!");
    } finally {
      setUploading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
        <div className="w-6 h-6 border-2 border-gray-200 border-t-black rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!order || !isDriver) return null;

  const shipping = order.shippingInfo;
  const isPickup = shipping?.deliveryType === "pickup";
  const dateStr = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleString("mn-MN")
    : "Огноо тодорхойгүй";
  const shortId = order.id.substring(0, 8).toUpperCase();

  const fullAddress = isPickup
    ? "Төв дэлгүүр, Улаанбаатар галерей 2 давхар"
    : `${shipping?.city || ""}, ${shipping?.district || ""}, ${shipping?.khoroo || ""}, ${shipping?.building || ""} ${shipping?.apartmentNumber ? `Тоот: ${shipping.apartmentNumber}` : ""} ${shipping?.additionalInfo || ""}`;

  return (
    <>
      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 relative">
            <button onClick={() => setShowConfirmModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black">
              <X size={20} />
            </button>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-orange-500" />
              </div>
              <h3 className="text-lg font-black text-[#111] mb-2">Та хүргэлтийг амжилттай хүргэсэн үү?</h3>
              <p className="text-[13px] text-gray-500">Хүргэсэн цэцгийнхээ зургийг дарж баталгаажуулна уу.</p>
            </div>

            {photoPreview ? (
              <div className="relative mb-4">
                <img src={photoPreview} alt="Preview" className="w-full h-56 object-cover rounded-2xl" />
                <button
                  onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center gap-3 mb-4 hover:border-gray-400 transition"
              >
                <Camera size={32} className="text-gray-300" />
                <p className="text-[13px] text-gray-400 font-medium">Зураг дарах / сонгох</p>
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoSelect} />

            <button
              onClick={handleConfirmDelivery}
              disabled={!photoFile || uploading}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-[13px] hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {uploading ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> Илгээж байна...</>
              ) : (
                <><CheckCircle2 size={18} /> Баталгаажуулах</>
              )}
            </button>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-[#FAFAFA] text-[#111] pb-24 font-sans">
        {/* Sticky header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-30">
          <div className="max-w-[800px] mx-auto px-6 py-3 flex items-center justify-between">
            <button onClick={() => router.push("/delivery")} className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-black transition">
              <ChevronLeft size={18} /> Буцах
            </button>
            <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
              order.status === "Хүргэгдсэн" ? "bg-green-50 text-green-600" :
              order.status === "Хүргэлтэнд гарсан" ? "bg-blue-50 text-blue-600" :
              "bg-orange-50 text-orange-600"
            }`}>
              {order.status}
            </span>
          </div>
        </div>

        <div className="max-w-[800px] mx-auto px-6 pt-8">
          {/* Header */}
          <div className="mb-8">
            <p className="text-[12px] text-gray-500 mb-1">Захиалга</p>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-black">#{shortId}</h1>
              <span className={`text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                order.paymentStatus === "Төлөгдсөн"
                  ? "bg-green-50 text-green-600"
                  : "bg-orange-50 text-orange-600"
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${order.paymentStatus === "Төлөгдсөн" ? "bg-green-500" : "bg-orange-500"}`}></div>
                {order.paymentStatus === "Төлөгдсөн" ? "Төлөгдсөн" : "Төлөөгүй"}
              </span>
            </div>
            <p className="text-[13px] text-gray-500 mt-2">{dateStr} · {order.items?.length || 0} бараа</p>
          </div>

          {/* Хүргэлтийн хаяг - Тод, том */}
          <div className="bg-white border border-gray-100 rounded-2xl p-6 mb-6 shadow-sm">
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MapPin size={14} className="text-red-500" /> Хүргэх хаяг
            </h2>
            <p className="text-[15px] font-bold text-[#111] leading-relaxed mb-4">{fullAddress}</p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-[#111] text-white py-3 rounded-xl font-bold text-[12px] hover:bg-black transition-all uppercase tracking-widest"
              >
                <Navigation size={14} /> Газрын зураг
              </a>
              {shipping?.recipientPhone && (
                <a 
                  href={`tel:${shipping.recipientPhone}`}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-3 rounded-xl font-bold text-[12px] hover:bg-green-700 transition-all uppercase tracking-widest"
                >
                  <Phone size={14} /> Залгах
                </a>
              )}
            </div>
          </div>

          {/* Хүргэх огноо */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 rounded-xl flex items-center justify-center">
              <Calendar size={20} className="text-rose-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Хүргэх өдөр</p>
              <p className="text-[15px] font-bold text-[#111]">{shipping?.deliveryDate || "Тодорхойгүй"}</p>
            </div>
          </div>

          {/* Холбоо барих */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-6 shadow-sm">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
              <User size={16} className="text-gray-500" />
              <h2 className="text-[13px] font-bold text-gray-800">Холбоо барих</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Хүлээн авагч</p>
                  <p className="text-[14px] font-bold">{shipping?.recipientName}</p>
                  <p className="text-[12px] text-gray-500">{shipping?.recipientPhone}</p>
                </div>
                <a href={`tel:${shipping?.recipientPhone}`} className="p-3 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition">
                  <Phone size={18} />
                </a>
              </div>
              <div className="border-t border-gray-50 pt-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Илгээгч</p>
                  <p className="text-[14px] font-bold">{shipping?.senderName}</p>
                  <p className="text-[12px] text-gray-500">{shipping?.senderPhone}</p>
                </div>
                <a href={`tel:${shipping?.senderPhone}`} className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition">
                  <Phone size={18} />
                </a>
              </div>
            </div>
          </div>

          {/* Мэндчилгээний үг */}
          {shipping?.cardMessage && (
            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-5 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare size={14} className="text-purple-500" />
                <p className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Мэндчилгээний үг</p>
              </div>
              <p className="text-[14px] italic font-medium text-purple-700 leading-relaxed">&quot;{shipping.cardMessage}&quot;</p>
            </div>
          )}

          {/* Барааны жагсаалт */}
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

          {/* Төлбөрийн задаргаа */}
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden mb-8 shadow-sm">
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

          {/* ХҮРГЭЛТИЙН ҮЙЛДЭЛ */}
          {order.paymentStatus === "Төлөгдсөн" && order.status !== "Хүргэгдсэн" && (
            <div className="mb-8">
              {!deliveryStarted ? (
                <button
                  onClick={handleStartDelivery}
                  className="w-full bg-[#111] text-white py-5 rounded-2xl font-bold text-[14px] hover:bg-black active:scale-[0.98] transition-all shadow-[0_8px_30px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3 uppercase tracking-widest"
                >
                  <Play size={20} fill="white" /> Хүргэлт эхлүүлэх
                </button>
              ) : (
                <div ref={confirmSectionRef} className="space-y-4">
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center">
                    <Truck size={32} className="text-blue-600 mx-auto mb-3" />
                    <h3 className="text-[15px] font-bold text-blue-900 mb-1">Хүргэлт явагдаж байна</h3>
                    <p className="text-[12px] text-blue-600">Хүргэлтийг дуусгасны дараа доорх &quot;товчийг&quot; дарна уу.</p>
                  </div>
                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full bg-green-600 text-white py-5 rounded-2xl font-bold text-[14px] hover:bg-green-700 active:scale-[0.98] transition-all shadow-[0_8px_30px_rgba(34,197,94,0.3)] flex items-center justify-center gap-3 uppercase tracking-widest"
                  >
                    <CheckCircle2 size={20} /> Хүргэлт амжилттай
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Хүргэгдсэн banner */}
          {order.status === "Хүргэгдсэн" && (
            <div className="bg-green-50 border border-green-100 rounded-2xl p-8 mb-6 text-center">
              <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-black text-green-900 mb-1">Хүргэлт амжилттай!</h3>
              <p className="text-[13px] text-green-700 mb-4">Энэ захиалга амжилттай хүргэгдлээ.</p>
              {order.deliveryPhoto && (
                <img src={order.deliveryPhoto} alt="Хүргэлтийн зураг" className="w-full max-w-xs mx-auto rounded-2xl border border-green-200 shadow-sm" />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
