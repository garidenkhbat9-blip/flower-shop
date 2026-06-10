"use client";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { SlidersHorizontal, X, ChevronDown, Check, Heart, Flower2, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Product, Category } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const PACKAGING_OPTIONS = ["Баглаа", "Хайрцагтай", "Сагстай", "Хөрстэй"];
const SIZE_OPTIONS = ["Жижиг", "Дунд", "Том"];
const COLOR_OPTIONS = [
  { name: "Улаан", hex: "#E11D48" },
  { name: "Ягаан", hex: "#FB7185" },
  { name: "Цагаан", hex: "#FFFFFF" },
  { name: "Шар", hex: "#FACC15" },
  { name: "Улбар шар", hex: "#FB923C" },
  { name: "Хөх", hex: "#2563EB" },
  { name: "Солонго", hex: "linear-gradient(45deg, red, orange, yellow, green, blue, indigo, violet)" },
];

const PURPOSE_OPTIONS = [
  { label: "Хайрт ээждээ" },
  { label: "Хайраа илчлэх" },
  { label: "Уучлалт гуйх" },
  { label: "Баяр хүргэх" },
  { label: "Ойн баяр" },
  { label: "Төрсөн өдөр" },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const fadeUpVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 15 } }
};

export default function AllProductsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#FAFAFA]">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-[3px] border-gray-100 border-t-[#111] rounded-full animate-spin" />
          <span className="text-[10px] font-bold tracking-[0.3em] text-[#111] uppercase">Уншиж байна...</span>
        </motion.div>
      </div>
    }>
      <AllProductsContent />
    </Suspense>
  );
}

function AllProductsContent() {
  const searchParams = useSearchParams();
  const urlCategory = searchParams.get("category") || "";
  const searchQuery = searchParams.get("search") || "";

  const [products, setProducts] = useState<Product[]>([]);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    categories: [] as string[],
    packaging: [] as string[],
    colors: [] as string[],
    sizes: [] as string[],
    purposes: [] as string[],
    stems: [] as string[],
    flowerTypes: [] as string[],
  });

  useEffect(() => {
    if (searchParams.get("clear") === "true") {
      setFilters({ categories: [], packaging: [], colors: [], sizes: [], purposes: [], stems: [], flowerTypes: [] });
    } else if (urlCategory) {
      setFilters(prev => ({ ...prev, categories: [urlCategory] }));
    }
  }, [searchParams, urlCategory]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodSnap, catSnap] = await Promise.all([
          getDocs(collection(db, "products")),
          getDocs(collection(db, "categories")),
        ]);
        setProducts(prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[]);
        setDbCategories(catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[]);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const counts = useMemo(() => {
    const c: any = { packaging: {}, stems: {}, purposes: {}, categories: {}, sizes: {}, flowerTypes: {} };
    products.forEach(p => {
      p.categories?.forEach((cat: string) => {
        c.categories[cat] = (c.categories[cat] || 0) + 1;
      });
      if (p.packaging) c.packaging[p.packaging] = (c.packaging[p.packaging] || 0) + 1;
      if (p.size) c.sizes[p.size] = (c.sizes[p.size] || 0) + 1;
      if (p.stemCount) c.stems[p.stemCount] = (c.stems[p.stemCount] || 0) + 1;
      if (p.flowerType) c.flowerTypes[p.flowerType] = (c.flowerTypes[p.flowerType] || 0) + 1;
      p.purposes?.forEach((purp: string) => {
        c.purposes[purp] = (c.purposes[purp] || 0) + 1;
      });
    });
    return c;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchCat = filters.categories.length === 0 || p.categories?.some((c: string) => filters.categories.includes(c));
        const matchPack = filters.packaging.length === 0 || filters.packaging.includes(p.packaging);
        const matchColor = filters.colors.length === 0 || p.colors?.some((c: string) => filters.colors.includes(c));
        const matchSize = filters.sizes.length === 0 || filters.sizes.includes(p.size);
        const matchPurpose = filters.purposes.length === 0 || p.purposes?.some((t: string) => filters.purposes.includes(t));
        const matchStems = filters.stems.length === 0 || (p.stemCount && filters.stems.includes(p.stemCount.toString()));
        const matchFlowerType = filters.flowerTypes.length === 0 || (p.flowerType && filters.flowerTypes.includes(p.flowerType));
        const matchSearch = searchQuery === "" || p.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchPack && matchColor && matchSize && matchPurpose && matchStems && matchFlowerType && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return (a.discountedPrice || a.price) - (b.discountedPrice || b.price);
        if (sortBy === "price-desc") return (b.discountedPrice || b.price) - (a.discountedPrice || a.price);
        return 0;
      });
  }, [products, filters, sortBy, searchQuery]);

  const toggleFilter = (type: keyof typeof filters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value) ? prev[type].filter(item => item !== value) : [...prev[type], value],
    }));
  };

  const activeFilterCount = Object.values(filters).flat().length;
  const clearFilters = () => setFilters({ categories: [], packaging: [], colors: [], sizes: [], purposes: [], stems: [], flowerTypes: [] });

  const PurposeTags = () => {
    const hasActivePurpose = filters.purposes.length > 0;
    return (
      <div className="max-w-7xl mx-auto px-6 mb-16">
        <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
          <button
            onClick={() => setFilters(prev => ({ ...prev, purposes: [] }))}
            className={`flex-shrink-0 px-8 py-3.5 rounded-[2px] text-[10px] font-bold uppercase tracking-[0.2em] border transition-all duration-500 ${!hasActivePurpose
              ? "bg-[#F1F5F0] text-[#1A1A1A] border-[#87A96B]/30 shadow-sm"
              : "bg-white text-[#666] border-black/[0.08] hover:border-[#87A96B] hover:text-[#1A1A1A]"}`}
          >
            Бүгд
          </button>
          {PURPOSE_OPTIONS.map(({ label }) => {
            const isActive = filters.purposes.includes(label);
            return (
              <button
                key={label}
                onClick={() => toggleFilter("purposes", label)}
                className={`flex-shrink-0 px-8 py-3.5 rounded-[2px] text-[10px] font-bold uppercase tracking-[0.2em] border transition-all duration-500 ${isActive
                  ? "bg-[#F1F5F0] text-[#1A1A1A] border-[#87A96B]/30 shadow-sm"
                  : "bg-white text-[#666] border-black/[0.08] hover:border-[#87A96B] hover:text-[#1A1A1A]"}`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-[#FCFBF9] pb-32 font-montserrat text-[#1A1A1A]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-10 mb-8">
        <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.4em] font-medium text-[#1A1A1A]/30">
          <Link href="/" className="hover:text-[#1A1A1A] transition-colors">Нүүр</Link>
          <span className="opacity-50">/</span>
          <span className="text-[#1A1A1A]">Бүх бүтээгдэхүүн</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-16">
        <h1 className="text-4xl md:text-6xl font-playfair font-medium text-[#1A1A1A] tracking-tight">Манай цуглуулга</h1>
      </div>

      <PurposeTags />

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-6 mb-12">
        <div className="bg-white rounded-[2px] p-4 lg:px-8 lg:py-6 flex flex-col md:flex-row justify-between gap-6 shadow-sm border border-black/[0.03]">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center gap-3 text-[10px] font-medium text-[#1A1A1A] bg-[#FCFBF9] border border-black/[0.05] px-6 py-3 rounded-[2px] hover:border-[#1A1A1A] transition-all uppercase tracking-[0.2em]"
            >
              <SlidersHorizontal size={14} />
              Шүүлтүүр
            </button>
            <span className="text-[10px] text-[#1A1A1A]/30 font-medium uppercase tracking-[0.3em] lg:block">
              Нийт <span className="text-[#1A1A1A] font-bold">{filteredProducts.length}</span> бүтээгдэхүүн
            </span>
          </div>

          <div className="relative group">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full md:w-auto text-[10px] font-medium uppercase tracking-[0.2em] border border-black/[0.05] rounded-[2px] text-[#1A1A1A] px-6 py-3 lg:py-4 outline-none bg-[#FCFBF9] focus:border-[#1A1A1A] transition-all cursor-pointer appearance-none pr-12"
            >
              <option value="newest">Шинэ нь эхэндээ</option>
              <option value="price-asc">Үнэ: Багаас их</option>
              <option value="price-desc">Үнэ: Ихээс бага</option>
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30 pointer-events-none group-hover:text-[#1A1A1A] transition-colors" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex gap-16">

          {/* Desktop Sidebar Filter */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-28 space-y-12 bg-white p-10 rounded-[2px] shadow-sm border border-black/[0.03]">
              <FilterSection title="Ангилал">
                <div className="flex flex-col gap-4 mt-6">
                  {dbCategories.map(cat => (
                    <CheckboxItem
                      key={cat.id}
                      label={cat.name}
                      count={counts.categories[cat.name] || 0}
                      checked={filters.categories.includes(cat.name)}
                      onChange={() => toggleFilter("categories", cat.name)}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Савалгаа">
                <div className="flex flex-col gap-4 mt-6">
                  {PACKAGING_OPTIONS.map(opt => (
                    <CheckboxItem
                      key={opt}
                      label={opt}
                      count={counts.packaging[opt] || 0}
                      checked={filters.packaging.includes(opt)}
                      onChange={() => toggleFilter("packaging", opt)}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Цэцэгний төрөл">
                <div className="flex flex-col gap-4 mt-6">
                  {Object.keys(counts.flowerTypes).filter(Boolean).sort().map(type => (
                    <CheckboxItem
                      key={type}
                      label={type}
                      count={counts.flowerTypes[type]}
                      checked={filters.flowerTypes.includes(type)}
                      onChange={() => toggleFilter("flowerTypes", type)}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Ишний тоо">
                <div className="flex flex-col gap-4 mt-6">
                  {Object.keys(counts.stems).filter(Boolean).sort((a, b) => Number(a) - Number(b)).map(stem => (
                    <CheckboxItem
                      key={stem}
                      label={`${stem} ширхэг`}
                      count={counts.stems[stem]}
                      checked={filters.stems.includes(stem)}
                      onChange={() => toggleFilter("stems", stem)}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Хэмжээ">
                <div className="flex flex-col gap-4 mt-6">
                  {SIZE_OPTIONS.map(opt => (
                    <CheckboxItem
                      key={opt}
                      label={opt}
                      count={counts.sizes[opt] || 0}
                      checked={filters.sizes.includes(opt)}
                      onChange={() => toggleFilter("sizes", opt)}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Өнгөний сонголт">
                <div className="flex flex-wrap gap-4 mt-8">
                  {COLOR_OPTIONS.map(color => {
                    const isSelected = filters.colors.includes(color.name);
                    return (
                      <button
                        key={color.name}
                        onClick={() => toggleFilter("colors", color.name)}
                        className={`w-10 h-10 rounded-full border-2 transition-all ${isSelected ? "border-[#1A1A1A] scale-110 shadow-lg" : "border-black/[0.08] hover:border-[#1A1A1A] hover:scale-110"}`} style={{ background: color.hex }}
                        title={color.name}
                      />
                    );
                  })}
                </div>
              </FilterSection>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full mt-10 py-5 text-[10px] font-medium text-red-500 uppercase tracking-[0.3em] bg-red-50 hover:bg-red-500 hover:text-white rounded-[2px] transition-all"
                >
                  Цэвэрлэх ({activeFilterCount})
                </button>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-40 text-center bg-white rounded-[2px] shadow-sm border border-black/[0.03]">
                <Flower2 size={48} strokeWidth={1} className="text-[#1A1A1A]/10 mb-8" />
                <p className="text-[10px] text-[#1A1A1A]/30 font-medium uppercase tracking-[0.3em]">Бүтээгдэхүүн олдсонгүй</p>
                <button onClick={clearFilters} className="mt-8 text-[#1A1A1A] font-medium uppercase tracking-[0.2em] text-[10px] border-b border-[#1A1A1A]/20 pb-2 hover:border-[#1A1A1A] transition-all">Шүүлтүүр цэвэрлэх</button>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              >
                {filteredProducts.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    layout
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#1A1A1A]/40 backdrop-blur-sm"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-[85vw] max-w-sm h-full bg-[#FCFBF9] shadow-2xl flex flex-col"
            >
              {/* Fixed Header */}
              <div className="flex justify-between items-center p-8 pb-6 bg-[#FCFBF9] border-b border-black/[0.03] z-20">
                <span className="font-playfair font-medium text-2xl text-[#1A1A1A]">Шүүлтүүр</span>
                <button onClick={() => setIsFilterOpen(false)} className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-8 pt-6 space-y-12">
                <FilterSection title="Ангилал">
                  <div className="flex flex-col gap-4 mt-6">
                    {dbCategories.map(cat => (
                      <CheckboxItem
                        key={cat.id}
                        label={cat.name}
                        count={counts.categories[cat.name] || 0}
                        checked={filters.categories.includes(cat.name)}
                        onChange={() => toggleFilter("categories", cat.name)}
                      />
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Савалгаа">
                  <div className="flex flex-col gap-4 mt-6">
                    {PACKAGING_OPTIONS.map(opt => (
                      <CheckboxItem
                        key={opt}
                        label={opt}
                        count={counts.packaging[opt] || 0}
                        checked={filters.packaging.includes(opt)}
                        onChange={() => toggleFilter("packaging", opt)}
                      />
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Цэцэгний төрөл">
                  <div className="flex flex-col gap-4 mt-6">
                    {Object.keys(counts.flowerTypes).filter(Boolean).sort().map(type => (
                      <CheckboxItem
                        key={type}
                        label={type}
                        count={counts.flowerTypes[type]}
                        checked={filters.flowerTypes.includes(type)}
                        onChange={() => toggleFilter("flowerTypes", type)}
                      />
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Ишний тоо">
                  <div className="flex flex-col gap-4 mt-6">
                    {Object.keys(counts.stems).filter(Boolean).sort((a, b) => Number(a) - Number(b)).map(stem => (
                      <CheckboxItem
                        key={stem}
                        label={`${stem} ширхэг`}
                        count={counts.stems[stem]}
                        checked={filters.stems.includes(stem)}
                        onChange={() => toggleFilter("stems", stem)}
                      />
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Хэмжээ">
                  <div className="flex flex-col gap-4 mt-6">
                    {SIZE_OPTIONS.map(opt => (
                      <CheckboxItem
                        key={opt}
                        label={opt}
                        count={counts.sizes[opt] || 0}
                        checked={filters.sizes.includes(opt)}
                        onChange={() => toggleFilter("sizes", opt)}
                      />
                    ))}
                  </div>
                </FilterSection>

                <FilterSection title="Өнгөний сонголт">
                  <div className="flex flex-wrap gap-4 mt-8">
                    {COLOR_OPTIONS.map(color => {
                      const isSelected = filters.colors.includes(color.name);
                      return (
                        <button
                          key={color.name}
                          onClick={() => toggleFilter("colors", color.name)}
                          className={`w-10 h-10 rounded-full border-2 transition-all ${isSelected ? "border-[#1A1A1A] scale-110 shadow-lg" : "border-transparent hover:scale-110"}`}
                          style={{ background: color.hex }}
                          title={color.name}
                        />
                      );
                    })}
                  </div>
                </FilterSection>

                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="w-full mt-10 py-5 text-[10px] font-medium text-red-500 uppercase tracking-[0.3em] bg-red-50 hover:bg-red-500 hover:text-white rounded-[2px] transition-all"
                  >
                    Цэвэрлэх ({activeFilterCount})
                  </button>
                )}
              </div>

              {/* Fixed Footer */}
              <div className="p-8 pb-[calc(2rem+72px)] bg-white/80 backdrop-blur-xl border-t border-black/[0.03] z-20">
                <button onClick={() => setIsFilterOpen(false)} className="w-full bg-[#87A96B] text-white font-medium py-5 rounded-[2px] shadow-2xl uppercase tracking-[0.3em] text-[11px] transition-all active:scale-95">
                  Нийт {filteredProducts.length} цэцэг харах
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// --- Туслах компонентууд ---

function CheckboxItem({ label, count, checked, onChange }: any) {
  return (
    <label className="flex items-center justify-between cursor-pointer group py-1.5">
      <div className="flex items-center gap-4">
        <div className={`w-5 h-5 rounded-[2px] border transition-all flex items-center justify-center ${checked ? "bg-[#87A96B] border-[#87A96B]" : "border-black/[0.15] bg-white group-hover:border-[#87A96B]"}`}>          {checked && <Check size={12} className="text-white" strokeWidth={3} />}
        </div>
        <span className={`text-[12px] font-medium uppercase tracking-wider transition-colors ${checked ? "text-[#1A1A1A]" : "text-[#1A1A1A]/75 group-hover:text-[#1A1A1A]"}`}>{label}</span>
      </div>
      {count !== undefined && <span className="text-[10px] text-[#1A1A1A]/50 font-medium tabular-nums">{count}</span>}
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
    </label>
  );
}

function FilterSection({ title, children }: any) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border-b border-black/[0.03] pb-10 mb-10 last:border-0 last:pb-0 last:mb-0">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full mb-6">
        <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#1A1A1A]">{title}</span>
        <ChevronDown size={14} className={`transition-transform text-[#1A1A1A]/30 ${isOpen ? "" : "-rotate-90"}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const isWished = product.id ? isWishlisted(product.id) : false;

  return (
    <div className="group bg-white rounded-[2px] overflow-hidden border border-black/[0.03] hover:shadow-2xl hover:shadow-black/5 transition-all duration-700 flex flex-col h-full">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#FCFBF9]">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <Image 
            src={product.imageUrls?.[0] || "/placeholder.jpg"} 
            alt={product.name} 
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-1000" 
          />
        </Link>
        <div className="absolute top-4 left-4 z-20">
          {product.discountedPrice && (
            <span className="bg-[#87A96B] text-white text-[9px] font-medium px-4 py-2 rounded-[2px] uppercase tracking-widest shadow-sm">SALE</span>
          )}
        </div>
        {product.inStock === false && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-10 backdrop-blur-[1px]">
            <span className="bg-black text-white px-4 py-2 text-[10px] font-bold tracking-[0.3em] uppercase rounded-[2px] shadow-xl">Дууссан</span>
          </div>
        )}
        <button
          onClick={() => product.id && toggleWishlist(product.id)}
          className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 backdrop-blur-md border active:scale-90 ${isWished ? "bg-white border-white text-[#E2A9BE] shadow-lg shadow-[#E2A9BE]/20" : "bg-white/80 border-white/40 text-[#1A1A1A] hover:bg-white"}`}
        >
          <motion.div
            animate={isWished ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
          >
            <Heart size={18} fill={isWished ? "currentColor" : "none"} strokeWidth={isWished ? 0 : 2} className={isWished ? "scale-110" : ""} />
          </motion.div>
        </button>

        {/* Desktop Quick Buy */}
        <div className="absolute inset-x-4 bottom-4 translate-y-[120%] group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] hidden md:block z-20">
          <button
            onClick={(e) => { e.preventDefault(); if (product.inStock !== false) addToCart(product); }}
            disabled={product.inStock === false}
            className={`w-full text-white text-[10px] font-medium py-5 rounded-[2px] flex items-center justify-center gap-3 transition-all shadow-2xl uppercase tracking-[0.2em] ${product.inStock !== false ? 'bg-[#87A96B] hover:bg-[#76945d]' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            <ShoppingBag size={14} strokeWidth={1.5} /> {product.inStock !== false ? "Сагсанд нэмэх" : "Дууссан"}
          </button>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-[12px] md:text-[14px] font-medium text-[#1A1A1A] line-clamp-1 mb-2 hover:opacity-60 transition-opacity font-montserrat uppercase tracking-wider">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-3 mb-6 mt-auto">
          <span className="font-montserrat font-medium text-[13px] md:text-[14px] text-[#1A1A1A] tracking-wide">{(product.discountedPrice ?? product.price).toLocaleString()}₮</span>
          {product.discountedPrice && <span className="text-[11px] font-montserrat text-[#1A1A1A]/30 line-through font-light tracking-wide">{product.price.toLocaleString()}₮</span>}
        </div>

        {/* Mobile Buy Button */}
        <div className="mt-auto flex gap-3 md:hidden relative z-20">
          <button
            onClick={(e) => { e.preventDefault(); if (product.inStock !== false) addToCart(product); }}
            disabled={product.inStock === false}
            className={`flex-1 text-white py-4 rounded-[2px] flex items-center justify-center transition-all shadow-lg ${product.inStock !== false ? 'bg-[#87A96B] active:scale-95' : 'bg-gray-400 cursor-not-allowed'}`}
          >
            <ShoppingBag size={16} strokeWidth={1.5} />
          </button>
          <Link href={`/products/${product.id}`} className="flex-1 border border-black/[0.05] text-[#1A1A1A] text-[9px] font-medium uppercase tracking-[0.2em] py-4 rounded-[2px] flex items-center justify-center hover:border-[#1A1A1A] transition-all">Үзэх</Link>
        </div>
      </div>
    </div>
  );
}