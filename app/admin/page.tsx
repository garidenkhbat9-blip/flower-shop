"use client";

import { useEffect, useState } from "react";
import { db } from "../../lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Link from "next/link";

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
          .sort((a, b) => (b.orderDate?.seconds || 0) - (a.orderDate?.seconds || 0))
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
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Хянах самбар</h1>

      {/* Статистик картууд - Гар утсан дээр 2 баганаар харагдана */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-6">
        <StatCard icon="💰" color="bg-green-100 text-green-600" title="Орлого" value={`${(stats.totalRevenue / 1000).toFixed(0)}k`} />
        <StatCard icon="📦" color="bg-blue-100 text-blue-600" title="Захиалга" value={stats.totalOrders} />
        <StatCard icon="⏳" color="bg-yellow-100 text-yellow-600" title="Шийдвэрлээгүй" value={stats.pendingOrders} />
        <StatCard icon="🌸" color="bg-purple-100 text-purple-600" title="Бүтээгдэхүүн" value={stats.totalProducts} />
        {/* НЭМСЭН КАТЕГОРИ КАРТ */}
        <StatCard icon="📁" color="bg-orange-100 text-orange-600" title="Категори" value={stats.totalCategories} />
      </div>

      {/* Хамгийн сүүлийн захиалгууд */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 lg:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/30">
          <h2 className="text-sm lg:text-base font-bold text-gray-800 uppercase tracking-wider">Сүүлийн захиалгууд</h2>
          <Link href="/admin/orders" className="text-[10px] lg:text-xs text-green-600 font-bold hover:underline">
            БҮГДИЙГ ХАРАХ →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-10 text-center text-gray-500 text-sm">Захиалга байхгүй.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs lg:text-sm min-w-[500px]">
              <thead className="bg-gray-50 text-gray-400 uppercase text-[10px]">
                <tr>
                  <th className="p-4 font-bold">Огноо</th>
                  <th className="p-4 font-bold">Захиалагч</th>
                  <th className="p-4 font-bold">Дүн</th>
                  <th className="p-4 font-bold text-center">Төлөв</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-gray-400">
                      {order.orderDate 
                        ? new Date(order.orderDate.seconds * 1000).toLocaleDateString('mn-MN') 
                        : "---"}
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{order.shippingAddress?.name || "Нэргүй"}</p>
                      <p className="text-[10px] text-gray-400">{order.shippingAddress?.phone}</p>
                    </td>
                    <td className="p-4 font-black text-gray-700">
                      {order.totalAmount?.toLocaleString()} ₮
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${
                        order.status === 'Хүлээгдэж буй' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'Хүргэгдсэн' ? 'bg-green-100 text-green-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {order.status || "Шинэ"}
                      </span>
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

// Засагдсан Картын компонент
function StatCard({ icon, color, title, value }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center gap-2 aspect-square sm:aspect-auto sm:flex-row sm:justify-start sm:text-left">
      <div className={`p-3 rounded-xl text-xl ${color} shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 font-bold uppercase truncate">{title}</p>
        <p className="text-lg lg:text-xl font-black text-gray-800 truncate">{value}</p>
      </div>
    </div>
  );
}