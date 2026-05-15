"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, documentId } from "firebase/firestore";
import { Product } from "@/types";
import Link from "next/link";
import { Heart, ShoppingBag, Trash2 } from "lucide-react";

export default function WishlistSection() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (wishlist.length === 0) {
      setItems([]);
      return;
    }

    const fetchItems = async () => {
      setLoading(true);
      try {
        const chunks: string[][] = [];
        for (let i = 0; i < wishlist.length; i += 10) {
          chunks.push(wishlist.slice(i, i + 10));
        }

        const allItems: Product[] = [];
        for (const chunk of chunks) {
          const q = query(
            collection(db, "products"),
            where(documentId(), "in", chunk)
          );
          const snapshot = await getDocs(q);
          snapshot.forEach((doc) => {
            allItems.push({ id: doc.id, ...doc.data() } as Product);
          });
        }

        setItems(allItems);
      } catch (error) {
        console.error("Wishlist-ээс бүтээгдэхүүн уншихад алдаа гарлаа:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [wishlist]);

  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-gray-100 border-t-[#87A96B] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-10 animate-in fade-in duration-700">
        <div className="w-24 h-24 bg-[#FCFBF9] rounded-full flex items-center justify-center border border-black/[0.03] shadow-sm">
          <Heart className="w-8 h-8 text-[#1A1A1A]/10" strokeWidth={1} />
        </div>
        <div className="text-center space-y-4">
          <h3 className="text-2xl font-playfair font-medium text-[#1A1A1A]">Хүслийн жагсаалт хоосон байна</h3>
          <p className="text-[10px] text-[#1A1A1A]/30 font-light uppercase tracking-[0.4em] max-w-xs mx-auto">Та одоогоор ямар нэгэн бүтээгдэхүүн хадгалаагүй байна.</p>
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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-10">
        <Link href="/products" className="text-[10px] font-bold text-[#1A1A1A]/40 hover:text-[#1A1A1A] uppercase tracking-[0.4em] transition-all border-b border-black/10 pb-2">
          Бүх бараа харах
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
        {items.map((product) => (
          <div key={product.id} className="group bg-white rounded-[2px] overflow-hidden border border-black/[0.03] hover:shadow-2xl hover:shadow-black/[0.03] transition-all duration-700 flex flex-col h-full">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#FCFBF9]">
              <Link href={`/products/${product.id}`} className="block w-full h-full">
                <img src={product.imageUrls?.[0] || "/placeholder.jpg"} alt={product.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000" />
              </Link>
              <div className="absolute top-4 left-4">
                {product.discountedPrice && (
                  <span className="bg-[#87A96B] text-white text-[9px] font-bold px-3 py-1.5 rounded-[2px] uppercase tracking-widest shadow-sm">ХЯМДРАЛ</span>
                )}
              </div>
              <button
                onClick={() => removeFromWishlist(product.id || "")}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-white shadow-sm text-[#E2A9BE] hover:text-[#1A1A1A]/20"
              >
                <Heart size={16} fill="currentColor" strokeWidth={0} />
              </button>

              <div className="absolute inset-x-3 bottom-3 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-700 hidden md:block">
                <button onClick={() => addToCart(product)} className="w-full bg-[#87A96B] text-white text-[10px] font-bold py-4 rounded-[2px] flex items-center justify-center gap-2 hover:bg-[#76945d] transition-all shadow-2xl">
                  <ShoppingBag size={14} strokeWidth={1.5} /> Сагсанд нэмэх
                </button>
              </div>
            </div>

            <div className="p-4 md:p-6 flex flex-col flex-grow bg-white">
              <Link href={`/products/${product.id}`}>
                <h3 className="text-[11px] md:text-[12px] font-medium text-[#1A1A1A] line-clamp-1 mb-2 hover:opacity-60 transition-opacity font-montserrat uppercase tracking-wider">{product.name}</h3>
              </Link>
              <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-8">
                <span className="font-playfair font-medium text-[14px] md:text-[16px] text-[#1A1A1A]">{(product.discountedPrice ?? product.price).toLocaleString()}₮</span>
                {product.discountedPrice && <span className="text-[10px] md:text-[11px] text-[#999] line-through font-light">{(product.price).toLocaleString()}₮</span>}
              </div>

              <div className="mt-auto flex flex-col gap-2">
                <button onClick={() => addToCart(product)} className="md:hidden w-full bg-[#87A96B] text-white py-3 rounded-[2px] flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all">
                  <ShoppingBag size={14} strokeWidth={1.5} />
                  Сагсанд
                </button>
                <Link href={`/products/${product.id}`} className="w-full border border-black/[0.05] text-[#1A1A1A]/40 text-[9px] font-bold uppercase tracking-[0.2em] py-3 rounded-[2px] text-center hover:bg-[#FCFBF9] hover:text-[#1A1A1A] transition-all">
                  Дэлгэрэнгүй
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
