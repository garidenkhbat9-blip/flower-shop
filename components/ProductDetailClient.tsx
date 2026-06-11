"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, CreditCard, ChevronLeft, Check, ArrowRight, Eye, MapPin, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface ProductDetailClientProps {
  product: Product;
  recommended: Product[];
}

export default function ProductDetailClient({ product, recommended }: ProductDetailClientProps) {
  const router = useRouter();
  const [selectedImg, setSelectedImg] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, 1);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleCheckoutAction = () => {
    if (product) {
      addToCart(product, 1);
      router.push("/checkout");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-montserrat text-[#111] pb-32">
      {/* HEADER SPACE */}
      <div className="h-16 md:h-20" />

      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* TOP BAR: BACK & BREADCRUMBS */}
        <div className="py-6 flex flex-col gap-4">
          <button
            onClick={() => router.back()}
            className="w-fit flex items-center gap-2 bg-white border border-gray-100 px-6 py-2.5 rounded-full text-[10px] font-bold text-[#111] uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95"
          >
            <ChevronLeft size={16} /> БУЦАХ
          </button>
          
          <nav className="flex items-center gap-2 text-[9px] font-bold text-[#999] uppercase tracking-[0.2em] overflow-hidden whitespace-nowrap">
            <Link href="/" className="hover:text-black">НҮҮР</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-black">БҮХ БАРАА</Link>
            <span>/</span>
            <span className="text-black truncate">{product.name}</span>
          </nav>
        </div>

        {/* PRODUCT GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
          
          {/* IMAGE SECTIONS */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
            {/* Thumbnails (Left on Desktop, Bottom on Mobile) */}
            <div className="order-2 md:order-1 flex md:flex-col gap-2 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {product.imageUrls.map((url, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImg(index)}
                  className={`relative w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImg === index ? "border-[#111]" : "border-transparent bg-white shadow-sm"
                  }`}
                >
                  <Image src={url} alt="" fill className="object-contain p-1" sizes="100px" />
                </button>
              ))}
            </div>

            {/* Main Display */}
            <div className="order-1 md:order-2 flex-grow aspect-square relative bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImg}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full"
                >
                  <Image
                    src={product.imageUrls[selectedImg]}
                    alt={product.name}
                    fill
                    priority
                    className="object-contain p-6"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* CONTENT SECTION */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h1 className="text-3xl md:text-5xl font-playfair italic font-medium leading-tight mb-4">{product.name}</h1>
              <div className="flex items-baseline gap-4">
                {product.discountedPrice ? (
                  <>
                    <span className="text-3xl font-bold font-montserrat">{product.discountedPrice.toLocaleString()} ₮</span>
                    <span className="text-lg text-gray-400 line-through">{product.price.toLocaleString()} ₮</span>
                  </>
                ) : (
                  <span className="text-3xl font-bold font-montserrat">{product.price.toLocaleString()} ₮</span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {product.categories?.map(cat => (
                   <span key={cat} className="text-[9px] font-bold uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-full">{cat}</span>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="space-y-3 pt-6 border-t border-gray-100 hidden md:block">
              {product.inStock === false ? (
                <div className="bg-gray-100 text-gray-400 text-center py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest">
                  Дууссан байна
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className={`flex items-center justify-center gap-2 font-bold py-4 rounded-2xl transition-all uppercase text-[10px] tracking-widest border-2 ${
                      addedToCart ? "bg-green-600 border-green-600 text-white" : "border-[#87A96B] text-[#87A96B] hover:bg-[#87A96B] hover:text-white"
                    }`}
                  >
                    {addedToCart ? <Check size={16} /> : <ShoppingBag size={16} />}
                    {addedToCart ? "Нэмэгдлээ" : "Сагслах"}
                  </button>
                  <button
                    onClick={handleCheckoutAction}
                    className="flex items-center justify-center gap-2 bg-[#87A96B] text-white font-bold py-4 rounded-2xl hover:bg-[#76945d] transition-all uppercase text-[10px] tracking-widest shadow-lg shadow-[#87A96B]/20"
                  >
                    <CreditCard size={16} /> Худалдан авах
                  </button>
                </div>
              )}
            </div>

            {/* SPECS TABLE */}
            <div className="pt-8">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Үзүүлэлтүүд</h3>
              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50 shadow-sm">
                <div className="grid grid-cols-2">
                  <div className="p-4 border-r border-gray-50 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Өнгө</span>
                    <span className="text-sm font-semibold">{product.colors?.join(", ") || "—"}</span>
                  </div>
                  <div className="p-4 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Хэмжээ</span>
                    <span className="text-sm font-semibold">{product.size || "—"}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2">
                  <div className="p-4 border-r border-gray-50 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Баглаа</span>
                    <span className="text-sm font-semibold">{product.packaging || "—"}</span>
                  </div>
                  <div className="p-4 flex flex-col gap-1">
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Тоо ширхэг</span>
                    <span className="text-sm font-semibold">{product.stemCount ? `${product.stemCount} ширхэг` : "—"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RECOMMENDED SECTION */}
        {recommended.length > 0 && (
          <div className="mt-32">
            <h2 className="text-2xl md:text-4xl font-playfair font-medium italic mb-12">Танд санал болгох</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {recommended.map(item => (
                <Link key={item.id} href={`/products/${item.id}`} className="group flex flex-col gap-3">
                  <div className="aspect-[4/5] relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
                    <Image src={item.imageUrls[0]} alt={item.name} fill className="object-cover p-0 group-hover:scale-105 transition-transform duration-500" sizes="300px" />
                  </div>
                  <div>
                    <h3 className="text-[11px] font-bold uppercase tracking-tight line-clamp-1">{item.name}</h3>
                    <p className="text-xs font-black mt-1">{item.price.toLocaleString()} ₮</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center mt-20">
              <Link 
                href={product.categories?.[0] ? `/products?category=${encodeURIComponent(product.categories[0])}` : "/products"} 
                className="group flex items-center gap-4 bg-[#87A96B] text-white px-14 py-6 rounded-[50px_4px_50px_4px] text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-[#739458] transition-all duration-700 shadow-2xl shadow-[#87A96B]/20 hover:scale-[1.02] active:scale-95"
              >
                <span>Бүх барааг үзэх</span>
                <div className="w-8 h-[1px] bg-white/30 group-hover:w-12 transition-all duration-700" />
                <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform duration-700" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE STICKY */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-100 p-4 safe-area-pb">
         <div className="flex gap-3">
           <button onClick={handleAddToCart} className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest border-2 ${addedToCart ? "bg-green-600 border-green-600 text-white" : "border-[#87A96B] text-[#87A96B]"}`}>
             {addedToCart ? "✓" : <ShoppingBag size={16} />} 
           </button>
           <button onClick={handleCheckoutAction} className="flex-[3] bg-[#87A96B] text-white font-bold py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#87A96B]/20">
             Худалдан авах
           </button>
         </div>
      </div>
    </div>
  );
}
