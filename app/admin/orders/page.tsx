"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { useAdminDialog } from "@/context/AdminDialogContext";
import {
  Package, Truck, XCircle, Clock, ChevronDown, Phone, MapPin,
  MessageSquare, Trash2, CheckCircle2, Image as ImageIcon, Camera
} from "lucide-react";

interface Order {
  id: string;
  createdAt: any;
  shippingInfo: {
    senderName: string;
    senderPhone: string;
    recipientName: string;
    recipientPhone: string;
    deliveryDate: string;
    cardMessage: string;
    city?: string;
    district?: string;
    khoroo?: string;
    building?: string;
    apartmentNumber?: string;
    additionalInfo?: string;
    deliveryType?: string;
  };
  items: any[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
  deliveryPhoto?: string;
  deliveredAt?: any;
  deliveryStartedAt?: any;
}

export default function OrdersPage() {
  const { alert, confirm } = useAdminDialog();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("Бүгд");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [photoModal, setPhotoModal] = useState<string | null>(null);

  useEffect(() => {
    // Real-time listener for auto-updating status changes
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs
        .map(d => ({
          id: d.id,
          ...d.data()
        } as Order))
        .filter(order => order.paymentStatus === "Төлөгдсөн" || order.paymentStatus === "Paid");
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Orders fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "orders", orderId), { status: newStatus });
    } catch {
      await alert("Алдаа гарлаа");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (await confirm("Энэ захиалгыг бүр мөсөн устгах уу?")) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
      } catch {
        await alert("Устгах үед алдаа гарлаа");
      }
    }
  };

  const handleRemoveItemFromOrder = async (orderId: string, itemIdx: number) => {
    if (await confirm("Энэ барааг захиалгаас хасах уу?")) {
      try {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        const newItems = [...order.items];
        newItems.splice(itemIdx, 1);
        const newTotal = newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        await updateDoc(doc(db, "orders", orderId), { items: newItems, totalAmount: newTotal });
      } catch {
        await alert("Устгах үед алдаа гарлаа");
      }
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Хүлээгдэж буй": return { bg: "bg-orange-500", text: "text-orange-600", light: "bg-orange-50", icon: <Clock size={20} /> };
      case "Хүргэлтэнд гарсан": return { bg: "bg-blue-500", text: "text-blue-600", light: "bg-blue-50", icon: <Truck size={20} /> };
      case "Хүргэгдсэн": return { bg: "bg-green-500", text: "text-green-600", light: "bg-green-50", icon: <CheckCircle2 size={20} /> };
      default: return { bg: "bg-gray-500", text: "text-gray-800", light: "bg-gray-50", icon: <Package size={20} /> };
    }
  };

  const getAddress = (info: Order["shippingInfo"]) => {
    if (!info) return "";
    if (info.deliveryType === "pickup") return "Очиж авах · Төв дэлгүүр";
    return [info.city, info.district, info.khoroo, info.building, info.apartmentNumber ? `Тоот: ${info.apartmentNumber}` : "", info.additionalInfo].filter(Boolean).join(", ");
  };

  const filteredOrders = orders.filter(o => filterStatus === "Бүгд" || o.status === filterStatus);

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-[#1A1A1A] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto font-montserrat text-black">
      {/* Photo Modal */}
      {photoModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setPhotoModal(null)}>
          <div className="max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <img src={photoModal} alt="Хүргэлтийн зураг" className="w-full rounded-2xl shadow-2xl" />
            <button onClick={() => setPhotoModal(null)} className="mt-4 w-full bg-white text-black py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition">Хаах</button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6 mb-8">
        <h1 className="text-2xl lg:text-4xl font-playfair font-bold text-black">Захиалгын удирдлага</h1>
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {["Бүгд", "Хүлээгдэж буй", "Хүргэлтэнд гарсан", "Хүргэгдсэн"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-6 py-3 rounded-[2px] text-[9px] font-bold uppercase tracking-[0.2em] whitespace-nowrap transition-all ${
                filterStatus === status ? "bg-[#1A1A1A] text-white shadow-xl" : "bg-white border border-black/10 text-black hover:bg-gray-50"
              }`}
            >
              {status}
              {status !== "Бүгд" && (
                <span className="ml-2 text-black/80">
                  ({orders.filter(o => o.status === status).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-20 rounded-[2px] text-center border border-black/[0.03] shadow-sm">
            <p className="text-black text-[10px] font-semibold uppercase tracking-[0.3em]">Захиалга байхгүй байна</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const style = getStatusStyle(order.status);
            const isPickup = order.shippingInfo?.deliveryType === "pickup";
            const isPaid = order.paymentStatus === "Төлөгдсөн" || order.paymentStatus === "Paid";

            return (
              <div key={order.id} className="bg-white rounded-[2px] border border-black/[0.03] shadow-sm overflow-hidden transition-all hover:shadow-xl hover:shadow-black/5">
                {/* Summary */}
                <div className="p-4 lg:p-6 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 lg:p-3 rounded-xl lg:rounded-2xl ${style.light} ${style.text}`}>
                      {style.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="text-[9px] font-bold text-black uppercase tracking-[0.3em] mr-1">
                          #{order.id.slice(-6).toUpperCase()}
                        </p>
                        {isPaid ? (
                          <span className="flex items-center gap-1 bg-green-50 text-green-700 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border border-green-200">
                            <CheckCircle2 size={10} /> Төлөгдсөн
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 bg-orange-50 text-orange-700 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border border-orange-200">
                            <Clock size={10} /> Төлөөгүй
                          </span>
                        )}
                        <span className={`flex items-center gap-1 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm border ${
                          isPickup 
                            ? "bg-amber-50 text-amber-700 border-amber-200" 
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                          {isPickup ? "🏃‍♂️ Салбараас авах" : "🚚 Хүргэлтээр авах"}
                        </span>
                      </div>
                      <h3 className="font-playfair font-bold text-black text-base lg:text-lg truncate">
                        {order.shippingInfo?.recipientName}
                      </h3>
                      <p className="text-[10px] text-black font-medium mt-1">
                        {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : "Саяхан"}
                      </p>
                    </div>
                    {/* Delivery photo indicator */}
                    {order.deliveryPhoto && (
                      <button
                        onClick={() => setPhotoModal(order.deliveryPhoto!)}
                        className="p-2 bg-green-50 text-green-700 rounded-xl hover:bg-green-100 transition-colors flex items-center gap-1.5"
                        title="Хүргэлтийн зураг харах"
                      >
                        <Camera size={16} />
                        <span className="text-[9px] font-bold uppercase tracking-wider hidden sm:inline">Зураг</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-150 pt-3">
                    <div>
                      <p className="text-[9px] lg:text-[10px] font-bold text-black uppercase tracking-widest mb-0.5">Нийт дүн</p>
                      <p className="text-base lg:text-lg font-black text-black">{order.totalAmount?.toLocaleString()}₮</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-[9px] font-bold uppercase tracking-[0.1em] px-4 py-2.5 rounded-[2px] ${
                        order.status === "Хүлээгдэж буй" ? "bg-orange-50 text-orange-700 border border-orange-200" :
                        order.status === "Хүргэлтэнд гарсан" ? "bg-blue-50 text-blue-700 border border-blue-200" :
                        order.status === "Хүргэгдсэн" ? "bg-green-50 text-green-700 border border-green-200" : "bg-gray-50 text-black border border-gray-200"
                      }`}>
                        {order.status}
                      </span>
                      <button onClick={() => handleDeleteOrder(order.id)} className="p-2.5 bg-red-50 text-red-600 rounded-[2px] hover:bg-red-600 hover:text-white transition-all" title="Устгах">
                        <Trash2 size={16} />
                      </button>
                      <button onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)} className="p-2.5 bg-[#F3F2F0] rounded-[2px] text-black hover:bg-black hover:text-white transition-all">
                        <ChevronDown size={18} className={`transition-transform duration-300 ${expandedOrder === order.id ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {expandedOrder === order.id && (
                  <div className="px-6 pb-8 pt-2 border-t border-gray-100">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                      {/* Address & Message */}
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase text-black tracking-[0.3em] flex items-center gap-2"><MapPin size={14} strokeWidth={1.5} /> Хүргэлтийн хаяг</h4>
                        <div className="bg-[#FCFBF9] p-6 rounded-[2px] border border-black/10 space-y-4">
                          <p className="text-sm font-semibold leading-relaxed text-black">{getAddress(order.shippingInfo)}</p>
                          <div className="flex items-center gap-2 text-[9px] font-bold text-rose-700 bg-rose-50 w-fit px-4 py-1.5 rounded-[2px] uppercase tracking-wider border border-rose-200">
                            <Clock size={12} strokeWidth={1.5} /> {order.shippingInfo?.deliveryDate}
                          </div>
                        </div>
                        <h4 className="text-[10px] font-bold uppercase text-black tracking-[0.3em] flex items-center gap-2"><MessageSquare size={14} strokeWidth={1.5} /> Мэндчилгээ</h4>
                        <div className="bg-gray-50 p-6 rounded-[2px] border border-black/10">
                          <p className="text-[13px] italic font-semibold text-black leading-relaxed font-playfair">&quot;{order.shippingInfo?.cardMessage || "Мэндчилгээ байхгүй"}&quot;</p>
                        </div>
                      </div>

                      {/* Contacts */}
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase text-black tracking-[0.3em]">Холбоо барих</h4>
                        <ContactRow label="Хүлээн авагч" name={order.shippingInfo?.recipientName} phone={order.shippingInfo?.recipientPhone} color="bg-rose-50 border border-rose-100" textColor="text-rose-700" />
                        <ContactRow label="Илгээгч" name={order.shippingInfo?.senderName} phone={order.shippingInfo?.senderPhone} color="bg-[#F3F2F0] border border-gray-300" textColor="text-black" />
                      </div>

                      {/* Items + Delivery Photo */}
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-bold uppercase text-black tracking-[0.3em]">Захиалсан бараа</h4>
                        <div className="space-y-4">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-center gap-4 border-b border-gray-100 pb-4 last:border-0">
                              <img src={item.imageUrl} className="w-14 h-16 object-cover rounded-[2px] shadow-sm" alt="" />
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] font-bold text-black uppercase tracking-wider line-clamp-1">{item.name}</p>
                                <p className="text-[10px] text-black font-medium mt-1">{item.quantity} ш · {item.price?.toLocaleString()}₮</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <p className="text-[13px] font-playfair font-bold text-black">{(item.price * item.quantity).toLocaleString()}₮</p>
                                <button onClick={() => handleRemoveItemFromOrder(order.id, idx)} className="p-1.5 text-black/60 hover:text-red-600 transition-colors" title="Хасах">
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Delivery Photo Section */}
                        {order.deliveryPhoto && (
                          <div className="mt-8 pt-8 border-t border-gray-100">
                            <h4 className="text-[10px] font-bold uppercase text-black tracking-[0.3em] flex items-center gap-2 mb-4">
                              <Camera size={14} strokeWidth={1.5} /> Хүргэлтийн баталгаа
                            </h4>
                            <div className="relative cursor-pointer group" onClick={() => setPhotoModal(order.deliveryPhoto!)}>
                              <img src={order.deliveryPhoto} alt="Хүргэлтийн зураг" className="w-full h-48 object-cover rounded-[2px] border border-black/10 shadow-sm group-hover:opacity-90 transition" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <div className="bg-black/50 text-white px-6 py-3 rounded-[2px] text-[10px] font-bold uppercase tracking-[0.2em]">Томоор харах</div>
                              </div>
                            </div>
                            {order.deliveredAt?.toDate && (
                              <p className="text-[10px] text-green-700 font-bold mt-3 flex items-center gap-1.5 uppercase tracking-wider">
                                <CheckCircle2 size={12} strokeWidth={1.5} /> Хүргэгдсэн: {order.deliveredAt.toDate().toLocaleString("mn-MN")}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function ContactRow({ label, name, phone, color, textColor }: any) {
  return (
    <div className="p-6 rounded-[2px] border border-black/10 bg-white shadow-sm">
      <p className="text-[9px] font-bold text-black mb-3 uppercase tracking-[0.2em]">{label}</p>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[14px] font-playfair font-bold text-black tracking-tight">{name}</p>
          <p className={`text-[11px] font-semibold mt-1.5 tracking-wider ${textColor}`}>{phone}</p>
        </div>
        <a href={`tel:${phone}`} className={`p-3 ${color} ${textColor} rounded-full transition-all hover:scale-110 active:scale-95`}>
          <Phone size={16} strokeWidth={1.5} />
        </a>
      </div>
    </div>
  );
}