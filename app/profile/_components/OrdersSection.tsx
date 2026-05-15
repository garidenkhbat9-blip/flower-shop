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
            className="block bg-white border border-black/[0.03] rounded-[2px] p-8 hover:border-[#87A96B]/30 transition-all hover:shadow-2xl hover:shadow-black/[0.02] group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-8">
                <div className="w-14 h-14 bg-[#FCFBF9] rounded-[2px] flex items-center justify-center text-[#1A1A1A]/20 group-hover:bg-[#87A96B] group-hover:text-white transition-all duration-500">
                  <Package size={20} strokeWidth={1} />
                </div>
                <div>
                  <h4 className="font-playfair font-medium text-[18px] text-[#1A1A1A]">Захиалга #{shortId}</h4>
                  <p className="text-[10px] text-[#1A1A1A]/30 font-light uppercase tracking-[0.3em] mt-2">{dateStr} · {order.items?.length || 0} ITEMS</p>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-10">
                <div className="text-right">
                  <p className="font-playfair font-medium text-[18px] text-[#1A1A1A]">{order.totalAmount?.toLocaleString()}₮</p>
                  <div className="flex items-center gap-2 mt-2 justify-end">
                    {order.paymentStatus === "Төлөгдсөн" ? (
                      <span className="flex items-center gap-1.5 text-[9px] font-bold text-[#87A96B] uppercase tracking-[0.1em]">
                        <CheckCircle2 size={12} strokeWidth={2} /> Төлөгдсөн
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[9px] font-bold text-orange-400 uppercase tracking-[0.1em]">
                        <Clock size={12} strokeWidth={2} /> Төлөөгүй
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="text-[#1A1A1A]/10 group-hover:text-[#87A96B] group-hover:translate-x-1 transition-all" size={20} strokeWidth={1} />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}