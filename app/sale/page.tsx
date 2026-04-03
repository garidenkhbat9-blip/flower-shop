"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types";
import { ShoppingBag, Heart, Percent } from "lucide-react";
import Link from "next/link";

export default function SalePage() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        // discountedPrice талбар нь 0-ээс их байгаа бараануудыг татах
        const q = query(
          collection(db, "products"),
          where("discountedPrice", ">", 0),
          orderBy("discountedPrice", "desc")
        );
        
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        
        setSaleProducts(products);
      } catch (error) {
        console.error("Хямдралтай бараа татахад алдаа гарлаа:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSaleProducts();
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="w-8 h-8 border-4 border-[#e7d6da] border-t-[var(--primary)] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans">
      {/* Header хэсэг */}
      <div className="bg-[var(--primary)] py-12 px-6 text-center text-[var(--background)] relative overflow-hidden">
        <div className="absolute top-0 left-0 opacity-10 transform -rotate-12 translate-x-[-20%]">
          <Percent size={200} />
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter mb-2 relative z-10">
          Онцлох хямдрал
        </h1>
        <p className="text-[var(--background)] font-medium relative z-10 uppercase tracking-widest text-[10px]">
          Special offers just for you
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 mt-12">
        <div className="flex items-baseline gap-2 mb-8">
           <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">SALE ITEMS</h2>
           <span className="text-gray-400 font-bold text-sm">{saleProducts.length} бараа байна</span>
        </div>

        {saleProducts.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-gray-100 rounded-[40px]">
            <p className="text-gray-400 font-bold uppercase tracking-widest">Одоогоор хямдралтай бараа байхгүй байна.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
            {saleProducts.map((product) => (
              <SaleProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Sale Page-д зориулсан тусгай карт
function SaleProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const isWished = product.id ? isWishlisted(product.id) : false;
  const discountPercent = product.price && product.discountedPrice
    ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-[32px] p-2 border border-transparent hover:shadow-2xl transition-all duration-500 relative">
      {/* Хямдралын хувь нь устгагдсан (хэрэглэгчийн хүсэлтээр) */}
      <div className="relative aspect-[4/5] bg-gray-50 rounded-[28px] overflow-hidden mb-4 shadow-inner">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <img src={product.imageUrls?.[0] || "/placeholder.jpg"} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
        </Link>
        <button
          onClick={() => product.id && toggleWishlist(product.id)}
          className={`absolute top-4 right-4 p-2 rounded-full transition-all shadow-sm ${
            isWished ? "bg-[var(--primary)] text-[var(--background)]" : "bg-[var(--background)]/90 text-[var(--foreground)] hover:text-[var(--primary)]"
          }`}
          aria-label={isWished ? "Wishlist-с хасах" : "Wishlist-д нэмэх"}
        >
          <Heart size={16} fill={isWished ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="px-3 pb-4 text-center">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-xs md:text-sm font-black text-gray-800 line-clamp-1 mb-2 uppercase italic hover:text-[var(--primary)] transition-colors">{product.name}</h3>
        </Link>
        <div className="flex flex-col items-center gap-1">
           <span className="text-[var(--primary)] font-black text-base leading-none">
             {product.discountedPrice?.toLocaleString()}₮
           </span>
           <span className="text-[11px] text-gray-300 line-through font-bold leading-none">
             {product.price?.toLocaleString()}₮
           </span>
        </div>

        <button
          onClick={() => addToCart(product)}
          className="mt-3 w-full bg-[var(--primary)] text-[var(--background)] py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#d89bb1] transition"
        >
          Сагсанд нэмэх
        </button>

        <Link href={`/products/${product.id}`} className="mt-2 block w-full border border-gray-200 text-gray-600 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-100 transition">
           Дэлгэрэнгүй
        </Link>
      </div>
    </div>
  );
}