"use client";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { SlidersHorizontal, X, ChevronDown, Check, Heart, Flower2, ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { Product, Category } from "@/types";

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
  { label: "Хайрт ээждээ"},
  { label: "Хайраа илчлэх"},
  { label: "Уучлалт гуйх" },
  { label: "Баяр хүргэх"},
  { label: "Ойн баяр"},
  { label: "Төрсөн өдөр"},
];

export default function AllProductsPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#FFFDF9]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#E2A9BE] border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-[#87A96B] font-medium">Уншиж байна...</span>
        </div>
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
          getDocs(query(collection(db, "products"), orderBy("createdAt", "desc"))),
          getDocs(query(collection(db, "categories"), orderBy("name", "asc"))),
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
      (p as any).categories?.forEach((cat: string) => {
        c.categories[cat] = (c.categories[cat] || 0) + 1;
      });
      if (p.packaging) c.packaging[p.packaging] = (c.packaging[p.packaging] || 0) + 1;
      if (p.size) c.sizes[p.size] = (c.sizes[p.size] || 0) + 1;
      if (p.stemCount) c.stems[p.stemCount] = (c.stems[p.stemCount] || 0) + 1;
      if ((p as any).flowerType) c.flowerTypes[(p as any).flowerType] = (c.flowerTypes[(p as any).flowerType] || 0) + 1;
      (p as any).purposes?.forEach((purp: string) => {
        c.purposes[purp] = (c.purposes[purp] || 0) + 1;
      });
    });
    return c;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products
      .filter(p => {
        const matchCat = filters.categories.length === 0 || (p as any).categories?.some((c: string) => filters.categories.includes(c));
        const matchPack = filters.packaging.length === 0 || filters.packaging.includes(p.packaging);
        const matchColor = filters.colors.length === 0 || p.colors?.some((c: string) => filters.colors.includes(c));
        const matchSize = filters.sizes.length === 0 || filters.sizes.includes(p.size);
        const matchPurpose = filters.purposes.length === 0 || (p as any).purposes?.some((t: string) => filters.purposes.includes(t));
        const matchStems = filters.stems.length === 0 || (p.stemCount && filters.stems.includes(p.stemCount.toString()));
        const matchFlowerType = filters.flowerTypes.length === 0 || ((p as any).flowerType && filters.flowerTypes.includes((p as any).flowerType));
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          <button
            onClick={() => setFilters(prev => ({ ...prev, purposes: [] }))}
            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[13px] font-bold border transition-all ${
              !hasActivePurpose ? "bg-[#333333] text-white border-[#333333]" : "bg-white text-[#333333] border-[#f0ece8]"
            }`}
          >
            Бүгд
          </button>
          {PURPOSE_OPTIONS.map(({ label }) => {
            const isActive = filters.purposes.includes(label);
            return (
              <button
                key={label}
                onClick={() => toggleFilter("purposes", label)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[13px] font-bold border transition-all ${
                  isActive ? "bg-[#E2A9BE] text-white border-[#E2A9BE] shadow-md shadow-[#E2A9BE]/20" : "bg-white text-[#333333] border-[#f0ece8] hover:border-[#87A96B] hover:text-[#87A96B]"
                }`}
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
    <div className="min-h-screen bg-[#FFFDF9] pb-24 font-sans text-[#333333]">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 mb-4">
        <div className="flex items-center gap-1.5 text-[12px] text-[#999]">
          <Link href="/" className="hover:text-[#E2A9BE] transition">Нүүр</Link>
          <span>/</span>
          <span className="text-[#333333] font-medium">Бүх бүтээгдэхүүн</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-5">
        <h1 className="text-2xl sm:text-3xl font-black text-[#333333] tracking-tight">Бүх бүтээгдэхүүн</h1>
      </div>

      <PurposeTags />

      {/* Toolbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <div className="bg-white border border-[#f0ece8] rounded-2xl px-5 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 text-[13px] font-bold text-[#333333] bg-[#FFFDF9] border border-[#f0ece8] px-4 py-2.5 rounded-xl hover:border-[#E2A9BE]"
            >
              <SlidersHorizontal size={15} />
              Шүүлтүүр
            </button>
            <span className="text-[13px] text-[#999] font-medium">
              <span className="font-black text-[#333333]">{filteredProducts.length}</span> цэцэг олдлоо
            </span>
          </div>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="text-[13px] font-bold border border-[#f0ece8] rounded-xl text-[#333333] px-4 py-2.5 outline-none bg-white focus:border-[#E2A9BE] transition"
          >
            <option value="newest">Шинэ нь эхэндээ</option>
            <option value="price-asc">Үнэ: Багаас их</option>
            <option value="price-desc">Үнэ: Ихээс бага</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex gap-10">
          
          {/* Desktop Sidebar Filter */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-6">
              <FilterSection title="АНГИЛАЛ">
                <div className="flex flex-col gap-1 mt-3">
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

              <FilterSection title="САВАЛГАА">
                <div className="flex flex-col gap-1 mt-3">
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

              <FilterSection title="ЦЭЦЭГНИЙ ТӨРӨЛ">
                <div className="flex flex-col gap-1 mt-3">
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

              <FilterSection title="ТОО ШИРХЭГ (ИШ)">
                <div className="flex flex-col gap-1 mt-3">
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

              <FilterSection title="ХЭМЖЭЭ">
                <div className="flex flex-col gap-1 mt-3">
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

              <FilterSection title="ӨНГӨ">
                <div className="flex flex-wrap gap-2.5 mt-4">
                  {COLOR_OPTIONS.map(color => {
                    const isSelected = filters.colors.includes(color.name);
                    return (
                      <button
                        key={color.name}
                        onClick={() => toggleFilter("colors", color.name)}
                        className={`w-7 h-7 rounded-full border transition-all ${isSelected ? "ring-2 ring-offset-2 ring-[#E2A9BE]" : "border-gray-200"}`}
                        style={{ background: color.hex }}
                      />
                    );
                  })}
                </div>
              </FilterSection>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full mt-4 py-3 text-[11px] font-black text-red-400 uppercase tracking-widest border border-red-50 hover:bg-red-50 rounded-xl transition"
                >
                  Цэвэрлэх ({activeFilterCount})
                </button>
              )}
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-[32px] border border-[#f0ece8]">
                <Flower2 size={48} className="text-[#f0ece8] mb-4" />
                <p className="text-[#999] font-bold">Уучлаарай, цэцэг олдсонгүй.</p>
                <button onClick={clearFilters} className="mt-4 text-[#E2A9BE] font-black hover:underline">Шүүлтүүр цэвэрлэх</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {isFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-[#333333]/40 backdrop-blur-sm" onClick={() => setIsFilterOpen(false)} />
          <div className="relative ml-auto w-[85vw] max-w-sm h-full bg-[#FFFDF9] overflow-y-auto shadow-2xl p-6">
            <div className="flex justify-between items-center mb-8">
              <span className="font-black text-lg uppercase tracking-tight">Шүүлтүүр</span>
              <button onClick={() => setIsFilterOpen(false)} className="p-2 bg-white rounded-full shadow-sm"><X size={20} /></button>
            </div>
            {/* Sidebar content here */}
            <div className="space-y-8 pb-24">
               <FilterSection title="АНГИЛАЛ">
                  <div className="flex flex-col gap-1 mt-3">
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

              <FilterSection title="САВАЛГАА">
                <div className="flex flex-col gap-1 mt-3">
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

              <FilterSection title="ЦЭЦЭГНИЙ ТӨРӨЛ">
                <div className="flex flex-col gap-1 mt-3">
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

              <FilterSection title="ТОО ШИРХЭГ (ИШ)">
                <div className="flex flex-col gap-1 mt-3">
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

              <FilterSection title="ХЭМЖЭЭ">
                <div className="flex flex-col gap-1 mt-3">
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

              <FilterSection title="ӨНГӨ">
                <div className="flex flex-wrap gap-2.5 mt-4">
                  {COLOR_OPTIONS.map(color => {
                    const isSelected = filters.colors.includes(color.name);
                    return (
                      <button
                        key={color.name}
                        onClick={() => toggleFilter("colors", color.name)}
                        className={`w-7 h-7 rounded-full border transition-all ${isSelected ? "ring-2 ring-offset-2 ring-[#E2A9BE]" : "border-gray-200"}`}
                        style={{ background: color.hex }}
                      />
                    );
                  })}
                </div>
              </FilterSection>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="w-full mt-4 py-3 text-[11px] font-black text-red-400 uppercase tracking-widest border border-red-50 hover:bg-red-50 rounded-xl transition"
                >
                  Цэвэрлэх ({activeFilterCount})
                </button>
              )}

               <button onClick={() => setIsFilterOpen(false)} className="w-full bg-[#E2A9BE] text-white font-black py-4 rounded-2xl shadow-lg shadow-[#E2A9BE]/20 mt-10">
                  {filteredProducts.length} Цэцэг харах
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Туслах компонентууд ---

function CheckboxItem({ label, count, checked, onChange }: any) {
  return (
    <label className="flex items-center justify-between cursor-pointer group py-2 px-1">
      <div className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-lg border-2 transition-all flex items-center justify-center ${checked ? "bg-[#87A96B] border-[#87A96B]" : "border-[#f0ece8] bg-white group-hover:border-[#87A96B]"}`}>
          {checked && <Check size={12} className="text-white" strokeWidth={4} />}
        </div>
        <span className={`text-[13px] font-bold ${checked ? "text-[#333333]" : "text-[#999] group-hover:text-[#333333]"}`}>{label}</span>
      </div>
      {count !== undefined && <span className="text-[11px] text-[#ccc] font-bold">{count}</span>}
      <input type="checkbox" checked={checked} onChange={onChange} className="hidden" />
    </label>
  );
}

function FilterSection({ title, children }: any) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className="border-b border-[#f0ece8] pb-5">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center justify-between w-full mb-2">
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#ccc]">{title}</span>
        <ChevronDown size={14} className={`transition-transform text-[#ccc] ${isOpen ? "" : "-rotate-90"}`} />
      </button>
      {isOpen && children}
    </div>
  );
}

function ProductCard({ product }: { product: any }) {
  const { addToCart } = useCart();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const isWished = product.id ? isWishlisted(product.id) : false;

  return (
    <div className="group bg-white rounded-[32px] overflow-hidden border border-[#f0ece8] hover:shadow-2xl hover:shadow-[#E2A9BE]/10 transition-all duration-500 flex flex-col h-full">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f7f3f0]">
        <Link href={`/products/${product.id}`} className="block w-full h-full">
          <img src={product.imageUrls?.[0] || "/placeholder.jpg"} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        </Link>
        <div className="absolute top-4 left-4">
           {product.discountedPrice && (
             <span className="bg-[#E2A9BE] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">Хямдрал</span>
           )}
        </div>
        <button
          onClick={() => product.id && toggleWishlist(product.id)}
          className={`absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-md ${isWished ? "bg-[#E2A9BE] text-white" : "bg-white/70 text-[#999] hover:text-[#E2A9BE]"}`}
        >
          <Heart size={18} fill={isWished ? "currentColor" : "none"} />
        </button>
        {/* Desktop Quick Buy */}
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden md:block">
           <button onClick={() => addToCart(product)} className="w-full bg-[#333333] text-white text-xs font-black py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-[#E2A9BE] transition-all">
             <ShoppingBag size={14} /> Сагсанд нэмэх
           </button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <Link href={`/products/${product.id}`}>
          <h3 className="text-[14px] font-bold text-[#333333] line-clamp-1 mb-2 group-hover:text-[#E2A9BE] transition-colors">{product.name}</h3>
        </Link>
        <div className="flex items-center gap-3 mb-4">
          <span className="font-black text-[16px] text-[#333333]">{(product.discountedPrice ?? product.price).toLocaleString()}₮</span>
          {product.discountedPrice && <span className="text-xs text-[#ccc] line-through">{product.price.toLocaleString()}₮</span>}
        </div>
        
        {/* Mobile Buy Button */}
        <div className="mt-auto flex gap-2">
          <button onClick={() => addToCart(product)} className="md:hidden flex-1 bg-[#87A96B] text-white p-3 rounded-xl flex items-center justify-center"><ShoppingBag size={18} /></button>
          <Link href={`/products/${product.id}`} className="flex-1 border border-[#f0ece8] text-[#999] text-[11px] font-black uppercase tracking-wider py-3 rounded-xl text-center hover:border-[#E2A9BE] hover:text-[#E2A9BE] transition-all">Үзэх</Link>
        </div>
      </div>
    </div>
  );
}