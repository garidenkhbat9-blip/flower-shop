"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";
import { ShoppingCart, CreditCard, MapPin, Eye, ArrowRight, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImg, setSelectedImg] = useState(0);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProductData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, "products", id as string);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const productData = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(productData);

          // categories эсвэл category аль нь байгааг шалгаж query хийх
          const cats = (productData as any).categories as string[] | undefined;
          const catsSingle = (productData as any).category as string[] | undefined;
          const allCats = cats || catsSingle || [];
          if (allCats.length > 0) {
            const q = query(
              collection(db, "products"),
              where("categories", "array-contains-any", allCats),
              limit(9)
            );
            const recSnap = await getDocs(q);
            // categories field байхгүй бол category field-ээр дахин татна
            let recList = recSnap.docs
              .map(d => ({ id: d.id, ...d.data() } as Product))
              .filter(p => p.id !== id)
              .slice(0, 8);

            // Хэрэв categories query-ээр олдоогүй бол category field-ээр оролдох
            if (recList.length === 0 && allCats.length > 0) {
              const q2 = query(
                collection(db, "products"),
                where("category", "array-contains-any", allCats),
                limit(9)
              );
              const recSnap2 = await getDocs(q2);
              recList = recSnap2.docs
                .map(d => ({ id: d.id, ...d.data() } as Product))
                .filter(p => p.id !== id)
                .slice(0, 8);
            }
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

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleCheckoutAction = () => {
    if (!product) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    addToCart(product, 1);
    router.push("/checkout");
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400">Уншиж байна...</span>
        </div>
      </div>
    );

  if (!product)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p className="font-bold text-gray-500">Бүтээгдэхүүн олдсонгүй.</p>
        <Link href="/products" className="text-sm text-green-600 hover:underline">
          Бүх бараа руу буцах
        </Link>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50/50 pb-28 font-sans">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">

        {/* Буцах товч + Breadcrumbs */}
        <div className="flex flex-col gap-3 mb-8">
          {/* Mobile буцах товч */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition w-fit group"
          >
            <span className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center group-hover:border-gray-400 group-hover:bg-gray-50 transition shadow-sm">
              <ChevronLeft size={16} />
            </span>
            Буцах
          </button>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-black transition">Нүүр</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-black transition">Бүх бараа</Link>
            <span>/</span>
            <span className="text-black font-medium truncate max-w-[160px]">{product.name}</span>
          </div>
        </div>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-4 md:p-10 rounded-2xl shadow-sm border border-gray-100">

          {/* Images */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-4">
            {/* Thumbnails */}
            <div className="order-2 md:order-1 flex md:flex-col gap-2 shrink-0">
              {product.imageUrls.map((url, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImg(index)}
                  className={`w-14 h-14 md:w-18 md:h-18 rounded-xl overflow-hidden border-2 cursor-pointer transition-all flex-shrink-0 ${selectedImg === index
                      ? "border-green-600 shadow-md opacity-100"
                      : "border-transparent opacity-50 hover:opacity-75"
                    }`}
                >
                  <img src={url} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
            {/* Main Image */}
            <div className="order-1 md:order-2 flex-1 aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-gray-100">
              <img
                src={product.imageUrls[selectedImg]}
                alt={product.name}
                className="w-full h-full object-cover transition-all duration-300"
              />
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5 space-y-5">
            {/* Категори badge */}
            {(product as any).categories?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(product as any).categories.map((cat: string) => (
                  <span key={cat} className="text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-100">
                    {cat}
                  </span>
                ))}
              </div>
            )}

            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="space-y-1">
              <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">Үнэ</p>
              <div className="flex items-baseline gap-3">
                {product.discountedPrice ? (
                  <>
                    <p className="text-3xl font-black text-gray-900">
                      {product.discountedPrice.toLocaleString()} ₮
                    </p>
                    <p className="text-sm text-gray-300 line-through">
                      {product.price.toLocaleString()} ₮
                    </p>
                  </>
                ) : (
                  <p className="text-3xl font-black text-gray-900">
                    {product.price.toLocaleString()} ₮
                  </p>
                )}
              </div>
            </div>

            {/* Purposes */}
            {(product as any).purposes?.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {(product as any).purposes.map((p: string) => (
                  <span key={p} className="text-[11px] font-semibold bg-pink-50 text-pink-600 px-3 py-1 rounded-full border border-pink-100">
                    {p}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                className={`flex items-center justify-center gap-2 border-2 font-bold py-4 rounded-xl transition active:scale-95 uppercase text-xs tracking-widest ${addedToCart
                    ? "border-green-600 bg-green-600 text-white"
                    : "border-gray-900 text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <ShoppingCart size={16} />
                {addedToCart ? "Нэмэгдлээ ✓" : "Сагсанд хийх"}
              </button>
              <button
                onClick={handleCheckoutAction}
                className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 transition active:scale-95 uppercase text-xs tracking-widest shadow-lg shadow-green-100"
              >
                <CreditCard size={16} /> Худалдан авах
              </button>
            </div>

            {/* Stores */}
            <div className="pt-5 space-y-3 border-t border-gray-50">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                Худалдаалж буй салбарууд
              </p>
              <StoreItem name="Төв салбар" address="Бага тойрог, Улаанбаатар" />
              <StoreItem name="Наадмаар салбар" address="ХУД, 15-р хороо, Наадам Центр" />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="mt-10">
          <h2 className="text-lg font-bold text-gray-900 mb-5 uppercase tracking-tight">
            Үзүүлэлтүүд
          </h2>
          <div className="bg-white border border-gray-100 p-6 md:p-8 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-0 divide-y md:divide-y-0">
            <SpecRow label="Өнгө" value={product.colors?.join(", ") || "—"} />
            <SpecRow label="Тоо ширхэг" value={product.stemCount ? `${product.stemCount} ширхэг` : "—"} />
            <SpecRow label="Савалгаа" value={product.packaging || "—"} />
            <SpecRow label="Хэмжээ" value={product.size || "—"} />
            {product.description && (
              <div className="md:col-span-2 pt-5 mt-2 border-t border-gray-50">
                <p className="text-[13px] text-gray-500 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Санал болгох бараа — 8 хүртэл, "Бүх бараа харах" товчтой */}
        {recommended.length > 0 && (
          <div className="mt-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">
                  Танд санал болгох
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Ижил төстэй {recommended.length} бүтээгдэхүүн
                </p>
              </div>
              {/* ✅ Бүх бараа харах — /products руу буцаана */}
              <Link
                href="/products"
                className="flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-4 py-2 rounded-full transition"
              >
                Бүгдийг харах
                <ArrowRight size={13} />
              </Link>
            </div>

            {/* Grid — 2 col mobile, 4 col desktop, max 8 items */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {recommended.map(item => (
                <RecommendedCard
                  key={item.id}
                  item={item}
                  onAddToCart={() => addToCart(item, 1)}
                />
              ))}
            </div>

            {/* Bottom CTA — мөн /products руу */}
            <div className="mt-10 flex justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 border-2 border-gray-900 text-gray-900 font-bold px-8 py-3.5 rounded-full hover:bg-gray-900 hover:text-white transition-all duration-200 text-sm uppercase tracking-widest"
              >
                <ChevronLeft size={16} />
                Бүх бараа руу буцах
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Туслах Компонентууд ───────────────────────────────────────────────────

function SpecRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between py-3.5 px-2 border-b border-gray-50 last:border-0">
      <span className="text-[12px] font-bold text-gray-400 uppercase tracking-wide w-28 shrink-0">
        {label}
      </span>
      <span className="text-[13px] text-gray-700 font-medium text-right">{value}</span>
    </div>
  );
}

function StoreItem({ name, address }: { name: string; address: string }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border border-gray-50 bg-gray-50/50 hover:border-green-100 transition">
      <div className="p-2 bg-white rounded-lg border border-gray-100 text-green-600 flex-shrink-0">
        <MapPin size={15} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-800">{name}</p>
        <p className="text-[10px] text-gray-400 mt-0.5">{address}</p>
      </div>
    </div>
  );
}

function RecommendedCard({
  item,
  onAddToCart,
}: {
  item: Product;
  onAddToCart: () => void;
}) {
  const [added, setAdded] = useState(false);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    onAddToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col">
      {/* Image */}
      <Link href={`/products/${item.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50">
        <img
          src={item.imageUrls?.[0] || "/placeholder.jpg"}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm p-2.5 rounded-full transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
            <Eye size={18} className="text-gray-700" />
          </div>
        </div>
        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
            -{Math.round(((item.price - item.discountedPrice!) / item.price) * 100)}%
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 sm:p-4 flex flex-col flex-grow gap-2">
        <Link href={`/products/${item.id}`}>
          <h3 className="text-[12px] sm:text-sm font-bold text-gray-800 line-clamp-2 leading-snug hover:text-green-600 transition-colors uppercase">
            {item.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mt-auto">
          <p className={`font-black text-[14px] ${hasDiscount ? "text-red-500" : "text-gray-900"}`}>
            {(hasDiscount ? item.discountedPrice! : item.price).toLocaleString()} ₮
          </p>
          {hasDiscount && (
            <p className="text-[11px] text-gray-300 line-through">
              {item.price.toLocaleString()} ₮
            </p>
          )}
        </div>

        <button
          onClick={handleAdd}
          className={`w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${added
              ? "bg-green-600 text-white"
              : "bg-gray-900 hover:bg-green-600 text-white"
            }`}
        >
          <ShoppingCart size={13} />
          {added ? "Нэмэгдлээ ✓" : "Сагсанд нэмэх"}
        </button>
      </div>
    </div>
  );
}