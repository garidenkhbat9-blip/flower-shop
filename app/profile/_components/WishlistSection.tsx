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
          <p className="text-gray-500 font-medium">Хүслийн жагсаалт хоосон байна.</p>
          <Link href="/" className="text-teal-500 font-bold mt-2 inline-block hover:underline">
            Бараа үзэх
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">Хүслийн жагсаалт</h3>
        <button onClick={clearWishlist} className="text-xs text-red-500 hover:text-red-600 font-semibold">
          Бүгдийг цэвэрлэх
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((product) => (
          <div key={product.id} className="bg-white p-3 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex gap-3">
              <img
                src={product.imageUrls?.[0] || "/placeholder.jpg"}
                alt={product.name}
                className="w-24 h-24 object-cover rounded-lg"
              />
              <div className="flex-1">
                <Link href={`/products/${product.id}`} className="font-bold hover:text-green-600">
                  {product.name}
                </Link>
                <p className="text-sm text-gray-500 mt-1">{(product.discountedPrice ?? product.price)?.toLocaleString()}₮</p>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => addToCart(product)}
                    className="flex-1 text-xs uppercase font-black text-white bg-green-600 hover:bg-green-700 py-2 rounded-lg"
                  >
                    <ShoppingBag size={14} /> Сагсанд хийх
                  </button>
                  <button
                    onClick={() => removeFromWishlist(product.id || "")}
                    className="flex-1 text-xs uppercase font-black text-red-500 bg-red-50 hover:bg-red-100 py-2 rounded-lg"
                  >
                    <Trash2 size={14} /> Хасах
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
