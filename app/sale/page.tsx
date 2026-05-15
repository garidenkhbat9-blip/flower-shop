"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types";
import { ShoppingBag, Heart } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function SalePage() {
  const [saleProducts, setSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
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
    <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-[3px] border-gray-100 border-t-[#111] rounded-full animate-spin" />
        <span className="text-[10px] font-bold tracking-[0.3em] text-[#111] uppercase font-montserrat">Уншиж байна</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-24 font-montserrat selection:bg-[#111] selection:text-white">
      {/* Editorial Hero Section - More Compact */}
      <section className="relative h-[30vh] md:h-[40vh] flex items-center justify-center overflow-hidden bg-[#1A1A1A]">
        <div className="absolute inset-0 opacity-40">
          <img 
            src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=2070&auto=format&fit=crop" 
            className="w-full h-full object-cover" 
            alt="Luxury Flowers Background" 
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
        
        <div className="relative z-10 text-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="inline-block text-[10px] font-light tracking-[0.5em] text-white/70 mb-4 font-montserrat">
              Limited Selection — 2026
            </span>
            <h1 className="text-4xl md:text-6xl font-playfair font-medium text-white mb-6 tracking-tight">
              Sale <span className="italic font-normal text-white/80">Highlights</span>
            </h1>
            <div className="w-16 h-[1px] bg-white/30 mx-auto" />
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 md:px-12 mt-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
           <div className="space-y-1">
             <p className="text-[9px] font-light tracking-[0.4em] text-[#999] uppercase font-montserrat">Exclusive Offers</p>
             <h2 className="text-3xl md:text-5xl font-playfair font-medium text-[#111] tracking-tight leading-none">The Sale Edit</h2>
           </div>
           <span className="text-[#999] font-medium uppercase text-[9px] tracking-[0.2em] font-montserrat">{saleProducts.length} items available</span>
        </div>

        {saleProducts.length === 0 ? (
          <div className="py-24 text-center border border-black/[0.03] bg-white rounded-[2px] shadow-sm">
            <p className="text-[#999] font-light uppercase tracking-[0.3em] text-[10px] font-montserrat">Check back soon for new offers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
            {saleProducts.map((product, i) => (
              <SaleProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SaleProductCard({ product, index }: { product: any, index: number }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const isWished = product.id ? isWishlisted(product.id) : false;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="group flex flex-col"
    >
      <div className="relative aspect-[3/4] bg-white rounded-[2px] overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.02)] border border-black/[0.03] mb-4">
        <Link href={`/products/${product.id}`} className="block w-full h-full bg-[#FAFAFA]">
          <motion.img 
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            src={product.imageUrls?.[0] || "/placeholder.jpg"} 
            alt={product.name} 
            className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" 
          />
        </Link>
        
        {/* Elegant Sale Badge */}
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-[#87A96B] text-white text-[9px] font-bold uppercase tracking-[0.2em] px-3 py-1.5 rounded-[2px] shadow-xl">
            Offer
          </div>
        </div>

        {/* Glassmorphism Wishlist Button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={() => product.id && toggleWishlist(product.id)}
            className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all duration-500 active:scale-90 ${
              isWished 
                ? "bg-white border-white text-[#E2A9BE] shadow-lg shadow-[#E2A9BE]/20" 
                : "bg-white/60 border-white/40 text-[#111] hover:bg-white"
            }`}
          >
            <motion.div
              animate={isWished ? { scale: [1, 1.3, 1] } : { scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Heart size={14} fill={isWished ? "currentColor" : "none"} strokeWidth={isWished ? 0 : 2} />
            </motion.div>
          </button>
        </div>

        {/* Desktop Hover Add to Cart */}
        <div className="absolute inset-x-4 bottom-4 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hidden md:block z-20">
          <button 
            onClick={() => addToCart(product)} 
            className="w-full bg-[#87A96B] text-white text-[10px] uppercase tracking-[0.2em] font-medium py-4 rounded-[2px] flex items-center justify-center gap-2 hover:bg-[#76945d] transition-colors duration-300 shadow-2xl"
          >
            <ShoppingBag size={14} strokeWidth={1.5} />
            Quick Add
          </button>
        </div>
      </div>

      <div className="px-1 text-center md:text-left">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-[11px] md:text-[12px] font-medium text-[#111] leading-tight mb-2 uppercase tracking-wider font-montserrat line-clamp-1 group-hover:opacity-60 transition-opacity">
            {product.name}
          </h3>
        </Link>
        
        <div className="flex flex-col md:flex-row items-center md:items-baseline gap-2">
           <span className="text-[13px] font-bold text-[#111] font-montserrat tracking-tight">
             {product.discountedPrice?.toLocaleString()}₮
           </span>
           <span className="text-[10px] text-[#999] line-through font-medium font-montserrat">
             {product.price?.toLocaleString()}₮
           </span>
        </div>

        {/* Mobile View Add to Cart */}
        <button
          onClick={() => addToCart(product)}
          className="md:hidden mt-4 w-full bg-[#87A96B] text-white py-3 rounded-[2px] text-[10px] font-bold uppercase tracking-widest active:scale-[0.98] transition-all"
        >
          Add to Cart
        </button>
      </div>
    </motion.div>
  );
}