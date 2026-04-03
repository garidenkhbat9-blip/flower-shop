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
        <span className="text-sm text-gray-500">Ачааллаж байна...</span>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] space-y-4 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center">
          <Heart className="w-10 h-10 text-gray-300" />
        </div>
        <div className="text-center">
          <p className="text-[#333333] font-black">Хүслийн жагсаалт хоосон байна.</p>
          <Link href="/products" className="text-[#E2A9BE] font-black mt-2 inline-block hover:underline tracking-widest uppercase text-xs">
            Бүх бараа харах
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Link href="/products" className="text-xs font-black text-[#87A96B] hover:text-[#E2A9BE] uppercase tracking-widest transition-colors">
          Бүх бараа харах
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((product) => (
          <div key={product.id} className="group bg-white rounded-3xl overflow-hidden border border-[#f0ece8] hover:shadow-2xl hover:shadow-[#E2A9BE]/10 transition-all duration-500 flex flex-col h-full">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#FFFDF9]">
              <Link href={`/products/${product.id}`} className="block w-full h-full">
                <img src={product.imageUrls?.[0] || "/placeholder.jpg"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </Link>
              <div className="absolute top-4 left-4">
                {product.discountedPrice && (
                  <span className="bg-[#E2A9BE] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">ХЯМДРАЛ</span>
                )}
              </div>
              <button
                onClick={() => removeFromWishlist(product.id || "")}
                className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all bg-[#E2A9BE] text-white shadow-md hover:bg-[#d89bb1]"
              >
                <Heart size={18} fill="currentColor" />
              </button>

              <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
                <button onClick={() => addToCart(product)} className="w-full bg-[#333333] text-white text-xs font-black py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#E2A9BE] transition-all shadow-lg shadow-black/20">
                  <ShoppingBag size={14} /> Сагсанд нэмэх
                </button>
              </div>
            </div>

            <div className="p-5 flex flex-col flex-grow bg-white">
              <Link href={`/products/${product.id}`}>
                <h3 className="text-[14px] font-bold text-[#E2A9BE] line-clamp-1 mb-2 hover:underline">{product.name}</h3>
              </Link>
              <div className="flex items-center gap-3 mb-4">
                <span className="font-black text-[16px] text-[#333333]">{(product.discountedPrice ?? product.price).toLocaleString()}₮</span>
                {product.discountedPrice && <span className="text-xs text-[#ccc] line-through">{product.price.toLocaleString()}₮</span>}
              </div>

              <div className="mt-auto flex gap-2">
                <button onClick={() => addToCart(product)} className="md:hidden flex-1 bg-[#87A96B] text-white p-3 rounded-xl flex items-center justify-center hover:bg-[#74905a] transition-colors"><ShoppingBag size={18} /></button>
                <Link href={`/products/${product.id}`} className="flex-1 border border-[#f0ece8] text-[#999] text-[11px] font-black uppercase tracking-wider py-3 rounded-xl text-center hover:border-[#E2A9BE] hover:text-[#E2A9BE] transition-all">Үзэх</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
