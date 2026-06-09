"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, limit, getDocs, orderBy } from "firebase/firestore";
import { ShoppingCart, CreditCard, MapPin, Eye, ArrowRight, ChevronLeft, Check, Leaf } from "lucide-react";
import Link from "next/link";
import { Product } from "@/types";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

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
  const [activeCategories, setActiveCategories] = useState<string[]>([]);

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
            let recList = recSnap.docs
              .map(d => ({ id: d.id, ...d.data() } as Product))
              .filter(p => p.id !== id)
              .slice(0, 8);

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

  // Идэвхтэй категориудыг Firestore-оос татах
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const catSnap = await getDocs(collection(db, "categories"));
        const catNames = catSnap.docs.map(d => d.data().name as string).filter(Boolean);
        setActiveCategories(catNames);
      } catch (err) {
        console.error("Категори татахад алдаа:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleCheckoutAction = () => {
    if (!product) return;
    addToCart(product, 1, true);
    router.push("/checkout");
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-[3px] border-gray-100 border-t-[#111] rounded-full animate-spin" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#111] uppercase">Уншиж байна...</span>
        </motion.div>
      </div>
    );

  if (!product)
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-[#FAFAFA]">
        <p className="font-bold text-[#999] tracking-widest uppercase text-[10px]">Бүтээгдэхүүн олдсонгүй.</p>
        <Link href="/products" className="text-sm font-bold text-[#111] border-b-2 border-[#111] pb-1 hover:opacity-70 transition-opacity">
          Бүх бараа руу буцах
        </Link>
      </div>
    );

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#FAFAFA] pb-40 md:pb-28 font-montserrat text-[#1A1A1A]">
      <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">

        {/* Буцах товч + Breadcrumbs */}
        <div className="flex flex-col gap-4 mb-10">
          {/* Mobile буцах товч */}
          <button
            onClick={() => router.back()}
            className="flex items-center gap-3 text-xs font-bold text-[#111] hover:opacity-70 transition-opacity w-fit group uppercase tracking-widest"
          >
            <span className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center group-hover:border-[#111] transition-colors shadow-sm">
              <ChevronLeft size={16} />
            </span>
            Буцах
          </button>
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-[9px] font-light uppercase tracking-[0.4em] text-[#999]">
            <Link href="/" className="hover:text-[#1A1A1A] transition-colors">Нүүр</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-[#1A1A1A] transition-colors">Бүх бараа</Link>
            <span>/</span>
            <span className="text-[#1A1A1A] truncate max-w-[160px] md:max-w-[300px]">{product.name}</span>
          </div>
        </div>

        {/* Product Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 bg-white p-6 md:p-12 rounded-[32px] shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-black/[0.03]">

          {/* Images */}
          <div className="lg:col-span-7 flex flex-col md:flex-row gap-5">
            {/* Thumbnails */}
            <div className="order-2 md:order-1 flex md:flex-col gap-3 shrink-0 overflow-x-auto no-scrollbar pb-2 md:pb-0">
              {product.imageUrls.map((url, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImg(index)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-[2px] overflow-hidden border cursor-pointer transition-all flex-shrink-0 ${selectedImg === index
                    ? "border-[#1A1A1A] opacity-100"
                    : "border-transparent opacity-50 hover:opacity-100 bg-gray-50"
                    }`}
                >
                  <Image 
                    src={url} 
                    alt="" 
                    fill
                    sizes="80px"
                    className="w-full h-full object-cover" 
                  />
                </div>
              ))}
            </div>
            {/* Main Image */}
            <motion.div
              key={selectedImg}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="order-1 md:order-2 flex-1 aspect-square rounded-[2px] overflow-hidden bg-gray-50 border border-gray-100"
            >
              <Image
                src={product.imageUrls[selectedImg]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
              />
            </motion.div>
          </div>

          {/* Details */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-8">
            <div>
              {/* Категори badge — зөвхөн идэвхтэй категориудыг харуулна */}
              {(() => {
                const productCats = (product as any).categories || [];
                const filteredCats = productCats.filter((cat: string) => activeCategories.includes(cat));
                return filteredCats.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {filteredCats.map((cat: string) => (
                      <span key={cat} className="text-[10px] font-black uppercase tracking-[0.2em] bg-gray-100 text-[#111] px-3 py-1.5 rounded-full">
                        {cat}
                      </span>
                    ))}
                  </div>
                ) : null;
              })()}

              <h1 className="text-3xl md:text-5xl font-playfair font-medium text-[#1A1A1A] leading-[1.1] tracking-tight mb-4">{product.name}</h1>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <p className="text-[9px] font-light text-[#999] uppercase tracking-[0.5em]">Үнэ</p>
              <div className="flex items-baseline gap-4">
                {product.discountedPrice ? (
                  <>
                    <p className="text-3xl md:text-4xl font-montserrat font-medium text-[#1A1A1A] tracking-tight">
                      {product.discountedPrice.toLocaleString()} ₮
                    </p>
                    <p className="text-lg md:text-xl font-montserrat font-medium text-[#999] line-through">
                      {product.price.toLocaleString()} ₮
                    </p>
                  </>
                ) : (
                  <p className="text-3xl md:text-4xl font-montserrat font-medium text-[#1A1A1A] tracking-tight">
                    {product.price.toLocaleString()} ₮
                  </p>
                )}
              </div>
            </div>

            {/* Purposes */}
            {(product as any).purposes?.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {(product as any).purposes.map((p: string) => (
                  <span key={p} className="text-[10px] font-bold uppercase tracking-[0.1em] border border-gray-200 text-[#666] px-3.5 py-1.5 rounded-full">
                    {p}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons — desktop дээр харагдана, mobile-д sticky bar */}
            {product.inStock === false ? (
              <div className="hidden md:block pt-6 border-t border-gray-100">
                <div className="bg-gray-100 text-[#1A1A1A]/40 font-medium py-5 rounded-2xl text-center uppercase text-[10px] tracking-[0.2em]">
                  Уучлаарай, энэ бараа дууссан байна.
                </div>
              </div>
            ) : (
              <div className="hidden md:grid grid-cols-2 gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={handleAddToCart}
                  className={`flex items-center justify-center gap-2.5 border-2 font-bold py-4 rounded-2xl transition-all active:scale-95 uppercase text-[10px] tracking-[0.2em] ${addedToCart
                    ? "bg-[#87A96B] text-white border-[#87A96B] shadow-lg shadow-[#87A96B]/20"
                    : "border-[#87A96B] text-[#87A96B] hover:bg-[#87A96B] hover:text-white"
                    }`}
                >
                  {addedToCart ? <Check size={15} strokeWidth={2.5} /> : <ShoppingCart size={15} strokeWidth={1.8} />}
                  {addedToCart ? "Нэмэгдлээ" : "Сагсанд хийх"}
                </button>
                <button
                  onClick={handleCheckoutAction}
                  className="flex items-center justify-center gap-2.5 bg-[#87A96B] text-white font-bold py-4 rounded-2xl hover:bg-[#76945d] transition-all active:scale-95 uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-[#87A96B]/25"
                >
                  <CreditCard size={15} strokeWidth={1.8} /> Худалдан авах
                </button>
              </div>
            )}

            {/* Stores */}
            <div className="pt-6 space-y-4">
              <p className="text-[10px] font-black text-[#999] uppercase tracking-[0.2em]">
                Худалдаалж буй салбарууд
              </p>
              <StoreItem name="Төв салбар" address="Ulaanbaatar Galleria, 2-р давхар" />
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="mt-16 md:mt-24">
          <h2 className="text-2xl md:text-4xl font-bold text-[#1A1A1A] mb-8 tracking-tight">
            Үзүүлэлтүүд
          </h2>




          <div className="bg-white border border-black/[0.03] shadow-[0_4px_20px_rgba(0,0,0,0.02)] p-6 md:p-12 rounded-[2px] grid grid-cols-1 md:grid-cols-2 gap-0 divide-y border-gray-100 md:divide-y-0">
            <SpecRow label="Өнгө" value={product.colors?.join(", ") || "—"} />
            <SpecRow label="Тоо ширхэг" value={product.stemCount ? `${product.stemCount} ширхэг` : "—"} />
            <SpecRow label="Савалгаа" value={product.packaging || "—"} />
            <SpecRow label="Хэмжээ" value={product.size || "—"} />
            {product.description && (
              <div className="md:col-span-2 pt-8 mt-6 border-t border-gray-100">
                <p className="text-sm md:text-base text-[#666] leading-relaxed max-w-4xl">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* ✅ Санал болгох бараа — 8 хүртэл, "Бүх бараа харах" товчтой */}
        {recommended.length > 0 && (
          <div className="mt-24 md:mt-32">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <p className="text-[9px] font-light tracking-[0.5em] text-[#999] uppercase mb-3 font-montserrat">Explore</p>
                <h2 className="text-3xl md:text-5xl font-playfair font-medium text-[#1A1A1A] tracking-tight">
                  Танд санал болгох
                </h2>
              </div>
              {/*  Бүх бараа харах — /products руу буцаана */}
              {/* <Link
                href="/products"
                className="flex items-center gap-2 text-[10px] font-bold text-[#111] hover:opacity-70 transition-opacity uppercase tracking-widest border-b-2 border-[#111] pb-1 w-fit"
              >
                Бүгдийг харах
                <ArrowRight size={14} />
              </Link> */}
            </div>

            {/* Grid — 2 col mobile, 4 col desktop, max 8 items */}
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {recommended.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <RecommendedCard
                    item={item}
                    onAddToCart={() => addToCart(item, 1)}
                  />
                </motion.div>
              ))}
            </div>

            {/* Bottom CTA */}
            <div className="mt-12 flex justify-center">
              <Link
                href="/products"
                className="inline-flex items-center gap-3 bg-[#87A96B] text-white font-bold px-10 py-4 rounded-full hover:bg-[#76945d] transition-all duration-300 text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-[#87A96B]/25 hover:scale-105"
              >
                <Leaf size={15} />
                Бүх бараа харах
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* ── MOBILE STICKY ACTION BAR ── */}
      <div className="md:hidden fixed bottom-[60px] left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-gray-100 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] px-4 py-3 safe-area-pb">
        {product.inStock === false ? (
          <div className="bg-gray-100 text-gray-400 font-bold py-4 rounded-2xl text-center uppercase text-[10px] tracking-[0.2em]">
            Дууссан байна
          </div>
        ) : (
          <div className="flex gap-3">
            {/* Сагсанд */}
            <button
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 border-2 font-bold py-4 rounded-2xl transition-all active:scale-95 text-[10px] uppercase tracking-[0.15em] ${addedToCart
                ? "bg-[#87A96B] border-[#87A96B] text-white shadow-lg shadow-[#87A96B]/20"
                : "border-[#87A96B] text-[#87A96B]"
                }`}
            >
              {addedToCart ? (
                <><Check size={15} strokeWidth={2.5} /> Нэмэгдлээ</>
              ) : (
                <><ShoppingCart size={15} strokeWidth={1.8} /> Сагсанд</>
              )}
            </button>
            {/* Худалдан авах */}
            <button
              onClick={handleCheckoutAction}
              className="flex-[1.4] flex items-center justify-center gap-2 bg-[#87A96B] text-white font-bold py-4 rounded-2xl hover:bg-[#76945d] transition-all active:scale-95 text-[10px] uppercase tracking-[0.15em] shadow-lg shadow-[#87A96B]/30"
            >
              <CreditCard size={15} strokeWidth={1.8} /> Худалдан авах
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Туслах Компонентууд ───────────────────────────────────────────────────

function SpecRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="flex items-center justify-between py-4 px-5 border-b border-gray-100 last:border-0 md:border-b-0 md:even:border-l md:even:pl-8 group hover:bg-[#87A96B]/[0.03] transition-colors rounded-xl">
      <span className="text-[10px] font-bold text-[#1A1A1A]/40 uppercase tracking-[0.25em] shrink-0">
        {label}
      </span>
      <span className="text-[13px] text-[#1A1A1A] font-bold text-right ml-4">{value}</span>
    </div>
  );
}

function StoreItem({ name, address }: { name: string; address: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-[16px] border border-gray-100 bg-gray-50 hover:bg-white hover:border-[#111] hover:shadow-md transition-all duration-300 cursor-default">
      <div className="p-3 bg-white rounded-[12px] border border-gray-200 text-[#111] flex-shrink-0 shadow-sm">
        <MapPin size={16} />
      </div>
      <div>
        <p className="text-[13px] font-bold text-[#111]">{name}</p>
        <p className="text-[11px] text-[#666] mt-1 font-medium">{address}</p>
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
    <div className="group bg-white rounded-[2px] border border-black/[0.03] shadow-[0_4px_20px_rgba(0,0,0,0.02)] overflow-hidden hover:shadow-[0_10px_40px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col h-full">
      {/* Image */}
      <Link href={`/products/${item.id}`} className="block relative aspect-[4/5] overflow-hidden bg-gray-50">
        <Image
          src={item.imageUrls?.[0] || "/placeholder.jpg"}
          alt={item.name}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
          <div className="bg-white/90 backdrop-blur-md p-3 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)]">
            <Eye size={16} className="text-[#111]" />
          </div>
        </div>
        {item.inStock === false && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-20 backdrop-blur-[1px]">
            <span className="bg-black text-white px-4 py-2 text-[10px] font-bold tracking-[0.3em] uppercase rounded-[2px] shadow-xl">Дууссан</span>
          </div>
        )}
        {/* Discount badge */}
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-[#87A96B] text-white text-[9px] font-black px-3 py-1 rounded-full shadow-md uppercase tracking-widest">
            -{Math.round(((item.price - item.discountedPrice!) / item.price) * 100)}%
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-4 flex flex-col flex-grow gap-2">
        <Link href={`/products/${item.id}`}>
          <h3 className="text-[12px] sm:text-[13px] font-bold text-[#111] line-clamp-2 leading-snug hover:text-gray-500 transition-colors uppercase tracking-tight">
            {item.name}
          </h3>
        </Link>

        <div className="flex items-baseline gap-2 mt-auto mb-4">
          <p className={`font-black text-[14px] md:text-[15px] ${hasDiscount ? "text-[#111]" : "text-[#111]"}`}>
            {(hasDiscount ? item.discountedPrice! : item.price).toLocaleString()} ₮
          </p>
          {hasDiscount && (
            <p className="text-[10px] text-[#999] line-through font-medium">
              {item.price.toLocaleString()} ₮
            </p>
          )}
        </div>

        <button
          onClick={(e) => { e.preventDefault(); if (item.inStock !== false) handleAdd(e); }}
          disabled={item.inStock === false}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-[2px] text-[10px] uppercase tracking-[0.2em] font-medium transition-all duration-300 ${item.inStock === false ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : added ? "bg-[#87A96B] text-white shadow-md active:scale-95" : "bg-gray-50 hover:bg-[#87A96B] hover:text-white text-[#1A1A1A] border border-gray-100 active:scale-95"}`}
        >
          <ShoppingCart size={14} />
          {item.inStock === false ? "Дууссан" : added ? "Нэмэгдлээ ✓" : "Сагсанд нэмэх"}
        </button>
      </div>
    </div>
  );
}