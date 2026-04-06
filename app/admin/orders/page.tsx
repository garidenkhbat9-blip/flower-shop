"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy } from "firebase/firestore";
import { Package, Truck, XCircle, Clock, ChevronDown, User, Phone, MapPin, MessageSquare, ExternalLink, Trash2 } from "lucide-react";

interface Order {
  id: string;
  createdAt: any;
  shippingInfo: {
    senderName: string;
    senderPhone: string;
    recipientName: string;
    recipientPhone: string;
    deliveryAddress: string;
    deliveryDate: string;
    cardMessage: string;
  };
  items: any[];
  totalAmount: number;
  status: string;
  paymentStatus: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("Бүгд");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const ordersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Order));
      setOrders(ordersData);
    } catch (error) {
      console.error("Orders fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: newStatus });
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (error) {
      alert("Алдаа гарлаа");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (confirm("Энэ захиалгыг бүр мөсөн устгах уу?")) {
      try {
        await deleteDoc(doc(db, "orders", orderId));
        setOrders(orders.filter(o => o.id !== orderId));
      } catch (error) {
        alert("Устгах үед алдаа гарлаа");
      }
    }
  };

  const handleRemoveItemFromOrder = async (orderId: string, itemIdx: number) => {
    if (confirm("Энэ барааг захиалгаас хасах уу?")) {
      try {
        const order = orders.find(o => o.id === orderId);
        if (!order) return;
        const newItems = [...order.items];
        newItems.splice(itemIdx, 1);
        const newTotalAmount = newItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const orderRef = doc(db, "orders", orderId);
        await updateDoc(orderRef, { items: newItems, totalAmount: newTotalAmount });
        setOrders(orders.map(o => o.id === orderId ? { ...o, items: newItems, totalAmount: newTotalAmount } : o));
      } catch (error) {
        alert("Устгах үед алдаа гарлаа");
      }
    }
  };

  const filteredOrders = orders.filter(o => filterStatus === "Бүгд" || o.status === filterStatus);

  if (loading) return <div className="p-10 text-center animate-pulse font-bold text-gray-400">Уншиж байна...</div>;

  return (
    <div className="max-w-7xl mx-auto font-sans">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-xl lg:text-2xl font-black uppercase tracking-tighter italic">Захиалгын удирдлага</h1>
        
        {/* Статус шүүлтүүр */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {["Бүгд", "Хүлээгдэж буй", "Хүргэгдсэн", "Цуцлагдсан"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-full text-xs font-black uppercase whitespace-nowrap transition-all ${filterStatus === status ? "bg-[#333333] text-[#FFFDF9]" : "bg-white border text-gray-400 hover:text-[#E2A9BE]"}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white p-20 rounded-[40px] text-center border-2 border-dashed border-gray-100">
             <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Захиалга байхгүй байна</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-2xl lg:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden transition-all hover:shadow-md">
              {/* ХУРААНГУЙ ХЭСЭГ (Үргэлж харагдана) */}
              <div className="p-4 lg:p-6 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                   <div className={`p-2 lg:p-3 rounded-xl lg:rounded-2xl ${
                     order.status === 'Хүлээгдэж буй' ? 'bg-orange-50 text-orange-500' :
                     order.status === 'Хүргэгдсэн' ? 'bg-[#87A96B]/10 text-[#87A96B]' : 'bg-red-50 text-red-500'
                   }`}>
                      {order.status === 'Хүлээгдэж буй' ? <Clock size={20}/> : order.status === 'Хүргэгдсэн' ? <Truck size={20}/> : <XCircle size={20}/>}
                   </div>
                   <div className="min-w-0">
                      <p className="text-[9px] lg:text-[10px] font-black text-gray-300 uppercase tracking-widest leading-none mb-1">ID: {order.id.slice(-6).toUpperCase()}</p>
                      <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm lg:text-base truncate">{order.shippingInfo?.recipientName}</h3>
                      <p className="text-[10px] lg:text-xs text-gray-400 font-medium">{order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString() : "Саяхан"}</p>
                   </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                   <div>
                      <p className="text-[9px] lg:text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Нийт дүн</p>
                      <p className="text-base lg:text-lg font-black text-black">{(order.totalAmount + 5000).toLocaleString()}₮</p>
                   </div>
                   
                   <div className="flex items-center gap-2">
                      <select 
                        value={order.status} 
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`text-[9px] lg:text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl border-none outline-none cursor-pointer shadow-sm ${
                          order.status === 'Хүлээгдэж буй' ? 'bg-orange-500 text-white' :
                          order.status === 'Хүргэгдсэн' ? 'bg-[#87A96B] text-white' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        <option value="Хүлээгдэж буй">Хүлээгдэж буй</option>
                        <option value="Хүргэгдсэн">Хүргэгдсэн</option>
                        <option value="Цуцлагдсан">Цуцлагдсан</option>
                      </select>

                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                        title="Захиалга бүрмөсөн устгах"
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      <button 
                        onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                        className="p-2 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                      >
                        <ChevronDown size={18} className={`transition-transform duration-300 ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                      </button>
                   </div>
                </div>
              </div>

              {/* ДЭЛГЭРЭНГҮЙ ХЭСЭГ (Эвхэгддэг) */}
              {expandedOrder === order.id && (
                <div className="px-6 pb-8 pt-2 border-t border-gray-50 animate-in slide-in-from-top duration-300">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-6">
                    
                    {/* 1. Хүргэлтийн мэдээлэл */}
                    <div className="space-y-4">
                       <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2"><MapPin size={14}/> Хүргэлтийн хаяг</h4>
                       <div className="bg-gray-50 p-5 rounded-3xl space-y-3">
                          <p className="text-sm font-bold leading-relaxed">{order.shippingInfo?.deliveryAddress}</p>
                          <div className="flex items-center gap-2 text-xs font-black text-rose-500 bg-rose-50 w-fit px-3 py-1.5 rounded-lg">
                             <Clock size={12}/> {order.shippingInfo?.deliveryDate}
                          </div>
                       </div>
                       
                       <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-2"><MessageSquare size={14}/> Мэндчилгээ</h4>
                       <div className="bg-purple-50 p-5 rounded-3xl">
                          <p className="text-xs italic font-medium text-purple-700 leading-relaxed">"{order.shippingInfo?.cardMessage || 'Мэндчилгээ байхгүй'}"</p>
                       </div>
                    </div>

                    {/* 2. Холбоо барих */}
                    <div className="space-y-4">
                       <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Холбоо барих</h4>
                       <div className="space-y-2">
                          <ContactRow label="Хүлээн авагч" name={order.shippingInfo?.recipientName} phone={order.shippingInfo?.recipientPhone} color="bg-rose-50" textColor="text-rose-600" />
                          <ContactRow label="Илгээгч" name={order.shippingInfo?.senderName} phone={order.shippingInfo?.senderPhone} color="bg-blue-50" textColor="text-blue-600" />
                       </div>
                    </div>

                    {/* 3. Барааны жагсаалт */}
                    <div className="space-y-4">
                       <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-widest">Захиалсан бараа</h4>
                       <div className="space-y-3">
                           {order.items.map((item, idx) => (
                             <div key={idx} className="flex items-center gap-3 border-b border-gray-50 pb-3 last:border-0 relative">
                                <img src={item.imageUrl} className="w-12 h-14 object-cover rounded-xl shadow-sm" alt="" />
                                <div className="flex-1">
                                   <p className="text-xs font-black uppercase line-clamp-1">{item.name}</p>
                                   <p className="text-[10px] text-gray-400 font-bold">{item.quantity}ш x {item.price.toLocaleString()}₮</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="text-xs font-black">{(item.price * item.quantity).toLocaleString()}₮</p>
                                  <button
                                    onClick={() => handleRemoveItemFromOrder(order.id, idx)}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Барааг хасах"
                                  >
                                    <Trash2 size={14}/>
                                  </button>
                                </div>
                             </div>
                           ))}
                       </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Туслах компонент: Холбоо барих мэдээлэл
function ContactRow({ label, name, phone, color, textColor }: any) {
  return (
    <div className={`p-4 rounded-2xl border border-gray-100`}>
       <p className="text-[9px] font-black uppercase text-gray-400 mb-2 tracking-widest">{label}</p>
       <div className="flex items-center justify-between">
          <div>
             <p className="text-sm font-black uppercase tracking-tight">{name}</p>
             <p className={`text-xs font-bold mt-0.5 ${textColor}`}>{phone}</p>
          </div>
          <a href={`tel:${phone}`} className={`p-2 ${color} ${textColor} rounded-full`}>
             <Phone size={16} />
          </a>
       </div>
    </div>
  );
}