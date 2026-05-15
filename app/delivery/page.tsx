"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { Truck, MapPin, Clock, Package, CheckCircle2, ChevronRight, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface OrderListItem {
  id: string;
  status: string;
  paymentStatus?: string;
  shippingInfo?: {
    recipientName?: string;
    recipientPhone?: string;
    deliveryDate?: string;
    city?: string;
    district?: string;
    khoroo?: string;
    building?: string;
    apartmentNumber?: string;
    deliveryType?: string;
  };
  totalAmount: number;
  items: any[];
  createdAt?: any;
}

export default function DeliveryPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "delivering" | "delivered">("pending");
  const { userProfile, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;

    // Хэрвээ нэвтрээгүй эсвэл хүргэлтийн ажилтан/админ биш бол буцаах
    if (!userProfile || (userProfile.role !== "delivery" && userProfile.role !== "admin" && !userProfile.isAdmin)) {
      router.push("/");
      return;
    }

    // Real-time listener - төлөгдсөн захиалгуудыг сонсох
    const q = query(
      collection(db, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }) as OrderListItem)
        .filter(o => o.paymentStatus === "Төлөгдсөн" && o.shippingInfo?.deliveryType !== "pickup");
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      console.error("Захиалга татахад алдаа:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userProfile, authLoading, router]);

  const filteredOrders = orders.filter(order => {
    if (activeTab === "pending") return order.status === "Хүлээгдэж буй" || order.status === "Төлбөр төлөгдсөн";
    if (activeTab === "delivering") return order.status === "Хүргэлтэнд гарсан";
    if (activeTab === "delivered") return order.status === "Хүргэгдсэн";
    return true;
  });

  const pendingCount = orders.filter(o => o.status === "Хүлээгдэж буй" || o.status === "Төлбөр төлөгдсөн").length;
  const deliveringCount = orders.filter(o => o.status === "Хүргэлтэнд гарсан").length;
  const deliveredCount = orders.filter(o => o.status === "Хүргэгдсэн").length;

  const getAddressShort = (info: OrderListItem["shippingInfo"]) => {
    if (!info) return "Хаяг тодорхойгүй";
    if (info.deliveryType === "pickup") return "Очиж авах · Төв дэлгүүр";
    const parts = [info.district, info.khoroo, info.building].filter(Boolean);
    return parts.join(", ") || "Хаяг тодорхойгүй";
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FCFBF9]">
        <div className="flex flex-col items-center gap-6">
          <div className="w-10 h-10 border-2 border-gray-100 border-t-[#87A96B] rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-[0.4em]">Систем ачаалж байна</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF9] font-montserrat text-[#1A1A1A]">
      {/* Header */}
      <div className="bg-white border-b border-black/[0.03] sticky top-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-10">
            <div>
              <h1 className="text-2xl md:text-5xl font-playfair font-medium text-[#1A1A1A] tracking-tight leading-none">
                Хүргэлт
              </h1>
              <p className="text-[10px] text-[#1A1A1A]/60 mt-3 uppercase tracking-[0.3em] font-medium">
                Нийт <strong className="text-[#87A96B] font-bold">{orders.length}</strong> захиалга
              </p>
            </div>
            <div className="bg-[#FCFBF9] border border-black/[0.05] text-[#1A1A1A]/80 px-4 py-2.5 rounded-[2px] text-[10px] font-bold uppercase tracking-[0.2em] self-start md:self-auto shadow-sm">
              {userProfile?.displayName || userProfile?.email?.split("@")[0]}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 p-1 border border-black/[0.05] rounded-[2px] bg-[#FCFBF9]">
            <button
              onClick={() => setActiveTab("pending")}
              className={`flex-1 py-3.5 md:py-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-[2px] transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2.5 ${activeTab === "pending"
                  ? "bg-[#87A96B] text-white shadow-xl shadow-[#87A96B]/20"
                  : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
                }`}
            >
              <Clock size={14} strokeWidth={1.5} />
              <span className="hidden xs:inline">Хүлээгдэж буй</span>
              <span className="xs:hidden">Шинэ</span>
              {pendingCount > 0 && (
                <span className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-bold ${activeTab === 'pending' ? 'bg-white text-[#87A96B]' : 'bg-[#1A1A1A]/20 text-[#1A1A1A]'}`}>
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("delivering")}
              className={`flex-1 py-3.5 md:py-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-[2px] transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2.5 ${activeTab === "delivering"
                  ? "bg-[#87A96B] text-white shadow-xl shadow-[#87A96B]/20"
                  : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
                }`}
            >
              <Truck size={14} strokeWidth={1.5} />
              <span className="hidden xs:inline">Хүргэж буй</span>
              <span className="xs:hidden">Замдаа</span>
              {deliveringCount > 0 && (
                <span className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-bold ${activeTab === 'delivering' ? 'bg-white text-[#87A96B]' : 'bg-[#1A1A1A]/20 text-[#1A1A1A]'}`}>
                  {deliveringCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("delivered")}
              className={`flex-1 py-3.5 md:py-4 text-[9px] md:text-[10px] font-bold uppercase tracking-[0.1em] md:tracking-[0.2em] rounded-[2px] transition-all flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2.5 ${activeTab === "delivered"
                  ? "bg-[#87A96B] text-white shadow-xl shadow-[#87A96B]/20"
                  : "text-[#1A1A1A]/60 hover:text-[#1A1A1A]"
                }`}
            >
              <CheckCircle2 size={14} strokeWidth={1.5} />
              <span className="hidden xs:inline">Хүргэгдсэн</span>
              <span className="xs:hidden">Дууссан</span>
              {deliveredCount > 0 && (
                <span className={`w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center text-[8px] md:text-[9px] font-bold ${activeTab === 'delivered' ? 'bg-white text-[#87A96B]' : 'bg-[#1A1A1A]/20 text-[#1A1A1A]'}`}>
                  {deliveredCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-[2px] border border-black/[0.03] p-16 md:p-24 text-center shadow-sm flex flex-col items-center">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-[#FCFBF9] rounded-full flex items-center justify-center mb-6 md:mb-8">
              <Package size={28} strokeWidth={1} className="text-[#1A1A1A]/20" />
            </div>
            <h3 className="text-[9px] md:text-[10px] font-bold text-[#1A1A1A]/40 uppercase tracking-[0.4em]">
              {activeTab === "pending" && "Хүлээгдэж буй захиалга байхгүй"}
              {activeTab === "delivering" && "Хүргэлтэнд гарсан захиалга байхгүй"}
              {activeTab === "delivered" && "Хүргэгдсэн захиалга байхгүй"}
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {filteredOrders.map((order) => {
              const dateStr = order.createdAt?.toDate
                ? order.createdAt.toDate().toLocaleDateString("mn-MN")
                : "";

              return (
                <Link
                  key={order.id}
                  href={`/delivery/${order.id}`}
                  className="block bg-white rounded-[2px] border border-black/[0.05] shadow-sm hover:shadow-2xl hover:shadow-black/[0.03] hover:border-[#87A96B]/30 transition-all duration-500 overflow-hidden group"
                >
                  <div className="p-5 md:p-8">
                    {/* Top row */}
                    <div className="flex items-start justify-between mb-6 md:mb-8">
                      <div className="flex items-center gap-4 md:gap-5">
                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-[2px] flex items-center justify-center transition-all duration-500 ${order.status === "Хүргэлтэнд гарсан"
                            ? "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                            : order.status === "Хүргэгдсэн"
                              ? "bg-[#87A96B]/10 text-[#87A96B] group-hover:bg-[#87A96B] group-hover:text-white"
                              : "bg-orange-50 text-orange-500 group-hover:bg-orange-500 group-hover:text-white"
                          }`}>
                          {order.status === "Хүргэлтэнд гарсан" ? (
                            <Truck size={20} strokeWidth={1.5} />
                          ) : order.status === "Хүргэгдсэн" ? (
                            <CheckCircle2 size={20} strokeWidth={1.5} />
                          ) : (
                            <Clock size={20} strokeWidth={1.5} />
                          )}
                        </div>
                        <div>
                          <p className="text-[8px] md:text-[9px] font-bold text-[#1A1A1A]/40 uppercase tracking-[0.2em]">
                            #{order.id.slice(-6).toUpperCase()}
                          </p>
                          <h3 className="text-[15px] md:text-lg font-playfair font-medium text-[#1A1A1A] mt-1 line-clamp-1">
                            {order.shippingInfo?.recipientName || "Хүлээн авагч"}
                          </h3>
                        </div>
                      </div>
                      <ChevronRight size={18} strokeWidth={1} className="text-[#1A1A1A]/20 group-hover:text-[#87A96B] group-hover:translate-x-1 transition-all mt-1" />
                    </div>

                    {/* Info rows */}
                    <div className="space-y-3 md:space-y-4">
                      <div className="flex items-start gap-3 md:gap-4 text-[11px] md:text-[12px] text-[#1A1A1A]/80 leading-relaxed">
                        <MapPin size={14} strokeWidth={1.5} className="text-[#1A1A1A]/40 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{getAddressShort(order.shippingInfo)}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 md:gap-6 pt-3 border-t border-black/[0.03] mt-4">
                        <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest">
                          <Calendar size={13} strokeWidth={1.5} className="text-[#1A1A1A]/30" />
                          <span>{order.shippingInfo?.deliveryDate || dateStr || "Тодорхойгүй"}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] font-bold text-[#1A1A1A]/60 uppercase tracking-widest">
                          <Package size={13} strokeWidth={1.5} className="text-[#1A1A1A]/30" />
                          <span>{order.items?.length || 0} бараа</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom bar */}
                  <div className="px-5 md:px-8 py-4 md:py-5 bg-[#FCFBF9] border-t border-black/[0.03] flex items-center justify-between">
                    <p className="text-[10px] font-bold text-[#1A1A1A]/60 tracking-[0.1em]">
                      {order.shippingInfo?.recipientPhone}
                    </p>
                    <p className="text-[15px] md:text-lg font-playfair font-medium text-[#1A1A1A]">
                      {order.totalAmount?.toLocaleString()}₮
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
