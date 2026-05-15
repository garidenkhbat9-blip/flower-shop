"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Flower2,
  FolderTree,
  ArrowRight
} from "lucide-react";

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    totalCategories: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const productsSnap = await getDocs(collection(db, "products"));
        const categoriesSnap = await getDocs(collection(db, "categories"));
        const ordersSnap = await getDocs(collection(db, "orders"));

        let revenue = 0;
        let pendingCount = 0;
        const allOrders: any[] = [];

        ordersSnap.forEach((doc) => {
          const data = doc.data();
          allOrders.push({ id: doc.id, ...data });
          if (data.status !== "Цуцлагдсан") {
            revenue += data.totalAmount || 0;
          }
          if (data.status === "Хүлээгдэж буй") {
            pendingCount++;
          }
        });

        const sortedOrders = allOrders
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
          .slice(0, 5);

        setStats({
          totalRevenue: revenue,
          totalOrders: allOrders.length,
          pendingOrders: pendingCount,
          totalProducts: productsSnap.size,
          totalCategories: categoriesSnap.size,
        });
        setRecentOrders(sortedOrders);
      } catch (error) {
        console.error("Алдаа:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[50vh]">
        <div className="w-8 h-8 border-2 border-gray-100 border-t-[#1A1A1A] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-10 font-montserrat text-[#1A1A1A]">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl lg:text-4xl font-playfair font-medium">Dashboard</h1>
        <p className="text-[10px] text-[#1A1A1A]/30 uppercase tracking-[0.3em] font-light">Системийн ерөнхий тойм</p>
      </div>

      {/* Статистик картууд */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <StatCard icon={<DollarSign size={18} strokeWidth={1.5} />} title="Revenue" value={`${(stats.totalRevenue / 1000).toFixed(0)}k`} />
        <StatCard icon={<ShoppingBag size={18} strokeWidth={1.5} />} title="Orders" value={stats.totalOrders} />
        <StatCard icon={<Clock size={18} strokeWidth={1.5} />} title="Pending" value={stats.pendingOrders} />
        <StatCard icon={<Flower2 size={18} strokeWidth={1.5} />} title="Products" value={stats.totalProducts} />
        <StatCard icon={<FolderTree size={18} strokeWidth={1.5} />} title="Categories" value={stats.totalCategories} />
      </div>

      {/* Хамгийн сүүлийн захиалгууд */}
      <div className="bg-white rounded-[2px] border border-black/[0.03] shadow-sm overflow-hidden mt-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="p-8 border-b border-black/[0.03] flex justify-between items-end">
          <div className="space-y-1.5">
            <h2 className="text-[10px] font-medium text-[#1A1A1A]/30 uppercase tracking-[0.3em]">Recent Orders</h2>
            <p className="text-xl font-playfair font-medium">Сүүлийн захиалгууд</p>
          </div>
          <Link href="/admin/orders" className="text-[10px] text-[#1A1A1A] font-medium uppercase tracking-[0.2em] flex items-center gap-3 group transition-all">
            <span className="border-b border-black/[0.1] pb-1 group-hover:border-black transition-all">БҮГДИЙГ ХАРАХ</span>
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-24 text-center">
            <ShoppingBag size={40} className="mx-auto text-[#1A1A1A]/5 mb-6" strokeWidth={1} />
            <p className="text-[10px] text-[#1A1A1A]/30 uppercase tracking-[0.3em] font-light">Захиалга байхгүй байна</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px]">
              <thead className="bg-[#FCFBF9] text-[#1A1A1A]/30 uppercase text-[9px] font-medium tracking-[0.2em] border-b border-black/[0.03]">
                <tr>
                  <th className="p-8">Огноо</th>
                  <th className="p-8">Захиалагч</th>
                  <th className="p-8 text-right">Дүн</th>
                  <th className="p-8 text-center">Төлөв</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="p-8 text-[#1A1A1A]/30 font-light text-[11px] uppercase tracking-wider">
                      {order.createdAt
                        ? new Date(order.createdAt.seconds * 1000).toLocaleDateString('mn-MN')
                        : "---"}
                    </td>
                    <td className="p-8">
                      <p className="font-playfair font-medium text-[16px] text-[#1A1A1A] tracking-tight uppercase">{order.shippingInfo?.recipientName || order.shippingInfo?.senderName || "Нэргүй"}</p>
                      <p className="text-[10px] text-[#1A1A1A]/30 font-light uppercase tracking-[0.1em] mt-1.5">{order.shippingInfo?.recipientPhone}</p>
                    </td>
                    <td className="p-8 font-playfair font-medium text-[#1A1A1A] text-right text-[17px]">
                      {order.totalAmount?.toLocaleString()}₮
                    </td>
                    <td className="p-8">
                      <div className="flex flex-col items-center gap-2">
                        {order.shippingInfo?.deliveryType === "pickup" && (
                          <span className="bg-[#FCFBF9] text-[#1A1A1A]/30 border border-black/[0.05] px-2.5 py-1 rounded-[2px] text-[8px] font-medium uppercase tracking-widest">Pickup</span>
                        )}
                        <span className={`px-4 py-2 rounded-[2px] text-[9px] font-medium uppercase tracking-[0.1em] border transition-all ${order.status === 'Хүлээгдэж буй' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                            order.status === 'Хүргэгдсэн' ? 'bg-green-50 text-green-600 border-green-100' :
                              'bg-[#FCFBF9] text-[#1A1A1A]/40 border-black/[0.03]'
                          }`}>
                          {order.status || "Шинэ"}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Stat Card Component
function StatCard({ icon, title, value }: any) {
  return (
    <div className="bg-white p-8 rounded-[2px] border border-black/[0.03] shadow-sm flex flex-col gap-6 hover:shadow-md transition-shadow group">
      <div className="w-12 h-12 bg-[#F3F2F0] rounded-full flex items-center justify-center text-[#1A1A1A] group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-[9px] text-[#1A1A1A]/30 font-medium uppercase tracking-[0.3em] mb-2">{title}</p>
        <p className="text-2xl lg:text-3xl font-playfair font-medium text-[#1A1A1A]">{value}</p>
      </div>
    </div>
  );
}