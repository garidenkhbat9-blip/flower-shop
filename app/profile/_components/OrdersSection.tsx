import { useState, useEffect } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";
import { Package, ChevronRight, Clock, CheckCircle2, Truck } from "lucide-react";
import Link from "next/link";

export default function OrdersSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-6 h-6 border-2 border-gray-100 border-t-[#87A96B] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-10 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-[#FCFBF9] rounded-full flex items-center justify-center border border-black/[0.03] shadow-sm">
          <Package className="w-8 h-8 text-[#1A1A1A]/10" strokeWidth={1} />
        </div>
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-playfair font-medium text-[#1A1A1A]">Захиалга байхгүй байна</h3>
          <p className="text-[10px] text-[#1A1A1A]/30 font-light uppercase tracking-[0.4em] max-w-xs mx-auto">Та одоогоор ямар нэгэн захиалга хийгээгүй байна.</p>
          <div className="pt-6">
            <Link href="/products" className="bg-[#87A96B] text-white text-[10px] font-bold uppercase tracking-[0.4em] px-14 py-6 rounded-[2px] inline-block hover:bg-[#76945d] transition-all shadow-xl shadow-[#87A96B]/10">
              Дэлгүүр хэсэх
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {orders.map((order) => {
        const dateStr = order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString("mn-MN") : "Огноогүй";
        const shortId = order.id.substring(0, 8).toUpperCase();
        
        return (
          <Link 
            key={order.id} 
            href={`/order/${order.id}`}
            className="block bg-white border border-gray-200 rounded-xl p-5 md:p-8 hover:border-[#87A96B] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] group relative"
          >
            <div className="flex flex-col gap-6">
              {/* Header: Icon + ID + Date */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-[#FCFBF9] rounded-[2px] border border-black/[0.03] flex items-center justify-center text-[#1A1A1A]/30 group-hover:bg-[#87A96B] group-hover:text-white transition-all duration-500 shrink-0">
                    <Package size={18} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h4 className="font-montserrat font-medium text-[12px] md:text-[14px] text-[#1A1A1A] tracking-[0.1em] uppercase">Захиалга #{shortId}</h4>
                    <p className="text-[9px] text-[#1A1A1A]/40 font-light uppercase tracking-[0.3em] mt-1.5">{dateStr} · {order.items?.length || 0} БАРАА</p>
                  </div>
                </div>
                
                {/* Price */}
                <div className="text-right mt-1">
                  <p className="font-montserrat font-medium text-[16px] md:text-[18px] text-[#1A1A1A] tracking-wide">{order.totalAmount?.toLocaleString()}₮</p>
                </div>
              </div>

              <div className="w-full h-px bg-gray-100"></div>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full md:w-auto">
                  {/* Payment Status - Minimal */}
                  {order.paymentStatus === "Төлөгдсөн" ? (
                    <span className="flex items-center gap-1.5 text-[9px] font-medium text-[#1A1A1A]/40 uppercase tracking-[0.2em]">
                      <CheckCircle2 size={12} strokeWidth={1.5} /> Төлөгдсөн
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[9px] font-medium text-[#1A1A1A]/40 uppercase tracking-[0.2em]">
                      <Clock size={12} strokeWidth={1.5} /> Төлөөгүй
                    </span>
                  )}

                  {order.shippingInfo?.deliveryType !== "pickup" && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-[#1A1A1A]/10 hidden md:block"></span>

                      {/* Order Status - Minimal */}
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#87A96B] uppercase tracking-[0.2em]">
                        <Truck size={14} strokeWidth={2} className="text-[#87A96B]" /> 
                        {(!order.status || order.status === "Төлбөр төлөгдсөн" || order.status === "Шинэ захиалга") 
                          ? "Бэлтгэгдэж байна" 
                          : order.status}
                      </span>
                    </>
                  )}
                </div>

                {/* Always visible mobile button */}
                <div className="w-full md:w-auto flex justify-end mt-2 md:mt-0">
                  <span className="flex items-center justify-center gap-2 w-full md:w-auto bg-[#87A96B] md:bg-transparent md:text-[#87A96B] text-white px-6 py-4 md:p-0 rounded-[2px] md:rounded-none text-[9px] font-medium uppercase tracking-[0.3em] group-hover:opacity-60 transition-opacity">
                    Явц хянах <ChevronRight size={14} strokeWidth={1.5} />
                  </span>
                </div>
              </div>

            </div>
          </Link>
        );
      })}
    </div>
  );
}