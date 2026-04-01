"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";
import { ShoppingCart, CreditCard, MapPin, Check, Heart, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types";
import RecentlyViewed from "../../../components/RecentlyViewed"; 
import { useCart } from "@/context/CartContext"; // Сагсны hook-ийг нэмэв
import { useWishlist } from "@/context/WishlistContext";
import { useAuth } from "@/context/AuthContext"; // Auth нэмэх

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart(); 
  const { isWishlisted, toggleWishlist } = useWishlist();
  const { user } = useAuth(); 
  const [product, setProduct] = useState<Product | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);

  const isWished = product?.id ? isWishlisted(product.id) : false;

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, "products", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(productData);

          const recent = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
          const updatedRecent = [id, ...recent.filter((item: string) => item !== id)].slice(0, 10);
          localStorage.setItem("recentlyViewed", JSON.stringify(updatedRecent));  

          // Санал болгох бараа татах (Алдаанаас сэргийлж category шалгав)
          if (productData.category && productData.category.length > 0) {
            const q = query(
              collection(db, "products"),
              where("category", "array-contains-any", productData.category),
              limit(6)
            );
            const recSnap = await getDocs(q);
            const recList = recSnap.docs
              .map(d => ({ id: d.id, ...d.data() } as Product))
              .filter(p => p.id !== id)
              .slice(0, 5);
            setRecommended(recList);
          }
        }
      } catch (error) {
        console.error("Дата татахад алдаа гарлаа:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleCheckoutAction = () => {
    if (!product) return;

    // 1. Хэрэв нэвтрээгүй бол Login руу явуулна
    if (!user) {
      router.push("/auth/login");
      return;
    }

    // 2. Хэрэв нэвтэрсэн бол сагсанд нэмээд Checkout руу явуулна
    addToCart(product, 1);
    router.push("/checkout");
  };

  if (loading) return <div className="h-screen flex items-center justify-center animate-pulse text-gray-400 font-bold uppercase tracking-widest">Уншиж байна...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center font-bold">Бүтээгдэхүүн олдсонгүй.</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
        
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-8">
           <Link href="/" className="hover:text-black">Нүүр</Link> / 
           <Link href="/products" className="hover:text-black">Бүх бараа</Link> / 
           <span className="text-black font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-4 md:p-10 rounded-2xl shadow-sm border border-gray-100">
          
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
            <div className="order-2 md:order-1 flex md:flex-col gap-3 shrink-0">
              {product.imageUrls.map((url, index) => (
                <div 
                  key={index}
                  onClick={() => setSelectedImg(index)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${selectedImg === index ? 'border-green-600 shadow-md' : 'border-transparent opacity-60'}`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            <div className="order-1 md:order-2 flex-1 aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
               <img src={product.imageUrls[selectedImg]} alt={product.name} className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-gray-500 text-sm font-medium">
                {(product as any).flowerType || "Бүтээгдэхүүн"} #{(product.id?.slice(-5))}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm text-gray-400 font-medium">Үнэ</p>
              <div className="flex items-baseline gap-3">
                 <p className="text-3xl font-black text-gray-900">{product.price.toLocaleString()} ₮</p>
                 {product.discountedPrice && (
                    <p className="text-lg text-gray-300 line-through">{product.discountedPrice.toLocaleString()} ₮</p>
                 )}
              </div>
            </div>

            {/* Buttons - Энд логикийг холбосон */}
            <div className="grid grid-cols-2 gap-3 pt-4">
               <button 
                className="flex items-center justify-center gap-2 border-2 border-gray-900 text-gray-900 font-bold py-4 rounded-lg hover:bg-gray-50 transition active:scale-95 uppercase text-xs tracking-widest"
                    onClick={() => addToCart(product)}
               >
                  <ShoppingCart size={18} /> Сагсанд хийх
               </button>
               <button 
                onClick={handleCheckoutAction} // Шилжүүлэх логик нэмэв
                className="flex items-center justify-center gap-2 bg-[#69A501] text-white font-bold py-4 rounded-lg hover:bg-[#5a8c01] transition active:scale-95 uppercase text-xs tracking-widest shadow-lg shadow-green-100"
               >
                  <CreditCard size={18} /> Худалдан авах
               </button>
            </div>

            <div className="mt-4">
              <button
                onClick={() => product?.id && toggleWishlist(product.id)}
                className={`w-full py-3 text-sm font-black rounded-xl transition ${
                  isWished
                    ? "bg-red-500 text-white"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Heart size={14} /> {isWished ? "Хүсэлтээс хас" : "Хүсэлд нэм"}
              </button>
            </div>

            <div className="pt-6 space-y-4 border-t border-gray-50">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Худалдаалж буй салбарууд</p>
               <StoreItem name="Төв салбар" address="Бага тойрог, Улаанбаатар" phone="7733-7733" />
               <StoreItem name="Наадмаар салбар" address="ХУД, 15-р хороо, Наадам Центр" phone="7733-7733" />
            </div>
          </div>
        </div>

        <div className="mt-12">
           <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
             Үзүүлэлтүүд
           </h2>
           <div className="bg-[#fcfcfc] border border-gray-100 p-8 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-20">
              <SpecRow label="Ерөнхий өнгө:" value={product.colors?.join(", ") || "Алаг"} />
              <SpecRow label="Тоо ширхэг:" value={`${product.stemCount || '--'} Ширхэг`} />
              <SpecRow label="Савалгаа:" value={product.packaging} />
              <SpecRow label="Хэмжээ:" value={product.size} />
              <div className="md:col-span-2 pt-4 border-t border-gray-100 mt-2">
                 <p className="text-[13px] text-gray-500 leading-relaxed font-light">{product.description}</p>
              </div>
           </div>
        </div>

        {recommended.length > 0 && (
          <div className="mt-20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 uppercase tracking-tight">Танд санал болгох</h2>
              <Link href="/products" className="text-xs font-bold text-green-600 hover:underline">Бүгдийг харах</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
               {recommended.map(item => (
                 <RecommendedCard key={item.id} item={item} />
               ))}
            </div>
          </div>
        )}
        <RecentlyViewed currentProductId={id as string} />

      </div>
    </div>
  );
}

// Доорх SpecRow, StoreItem, RecommendedCard компонентууд таны өмнөх кодоор хэвээрээ байна...

// Туслах Компонентууд
function SpecRow({ label, value }: { label: string, value: any }) {
  return (
    <div className="flex items-center justify-between md:justify-start gap-10 border-b border-gray-50/50 py-3">
       <span className="text-[13px] font-bold text-gray-800 w-32 shrink-0">{label}</span>
       <span className="text-[13px] text-gray-500">{value}</span>
    </div>
  );
}

function StoreItem({ name, address, phone }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/30">
       <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400"><MapPin size={16}/></div>
          <div>
            <p className="text-xs font-bold text-gray-800">{name}</p>
            <p className="text-[10px] text-gray-400">{address}</p>
          </div>
       </div>
       <div className="text-right">
          <p className="text-[10px] font-bold text-gray-300">Үлдэгдэл</p>
          <p className="text-xs font-black text-gray-400">--</p>
       </div>
    </div>
  );
}

function RecommendedCard({ item }: { item: Product }) {
  return (
    <Link href={`/products/${item.id}`} className="group space-y-3 block">
       <div className="aspect-square rounded-xl overflow-hidden bg-gray-100 relative">
          <img src={item.imageUrls[0]} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
       </div>
       <div className="text-center">
          <h3 className="text-xs font-bold text-gray-800 uppercase line-clamp-1">{item.name}</h3>
          <p className="text-xs font-black text-gray-900 mt-1">{item.price.toLocaleString()} ₮</p>
       </div>
    </Link>
  );
}