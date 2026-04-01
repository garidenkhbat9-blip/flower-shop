"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { Product } from "@/types";

export default function RecentlyViewed({ currentProductId }: { currentProductId: string }) {
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      // 1. LocalStorage-оос үзсэн бараануудын ID-г авах
      const storedIds = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
      
      // Одоо үзэж байгаа барааг жагсаалтаас хасах
      const filteredIds = storedIds.filter((id: string) => id !== currentProductId).slice(0, 5);

      if (filteredIds.length === 0) return;

      try {
        // 2. ID бүрээр Firestore-оос дата татах
        const productPromises = filteredIds.map((id: string) => getDoc(doc(db, "products", id)));
        const snapshots = await Promise.all(productPromises);
        
        const products = snapshots
          .filter(s => s.exists())
          .map(s => ({ id: s.id, ...s.data() } as Product));

        setRecentProducts(products);
      } catch (error) {
        console.error("Recent products error:", error);
      }
    };

    fetchRecent();
  }, [currentProductId]);

  if (recentProducts.length === 0) return null;

  return (
    <div className="mt-16 border-t border-gray-100 pt-12">
      <h2 className="text-xl font-bold text-gray-900 mb-8 uppercase tracking-tight">Сүүлд үзсэн бараа</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recentProducts.map((product) => (
          <Link href={`/products/${product.id}`} key={product.id} className="group border border-gray-100 bg-white p-2 hover:shadow-sm transition-all">
            <div className="aspect-square overflow-hidden bg-gray-50 mb-3">
              <img 
                src={product.imageUrls[0]} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                alt="" 
              />
            </div>
            <div className="text-center">
              <h3 className="text-[11px] font-bold text-gray-800 uppercase line-clamp-1">{product.name}</h3>
              <p className="text-[12px] font-black text-gray-900 mt-1">{product.price.toLocaleString()} ₮</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}