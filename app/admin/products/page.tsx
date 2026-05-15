"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, doc, deleteDoc, updateDoc } from "firebase/firestore";
import Link from "next/link";
import { Product } from "@/types";
import { ChevronLeft, ChevronRight, X, Search, Package, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ProductsListPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // --- ШҮҮЛТҮҮРИЙН ТӨЛӨВҮҮД ---
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, inStock, outOfStock

  // --- БУСАД ТӨЛӨВҮҮД ---
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: "", name: "" });
  const [toast, setToast] = useState<{ show: boolean; message: string; type: "success" | "error" }>({ show: false, message: "", type: "success" });
  const [lightbox, setLightbox] = useState({ isOpen: false, images: [] as string[], index: 0 });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "products"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const productsData = querySnapshot.docs.map(document => ({
        id: document.id,
        ...document.data()
      })) as Product[];
      setProducts(productsData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  // --- ДИНАМИК ХАЙЛТ БОЛОН ШҮҮЛТҮҮР (Мемо-жуулсан) ---
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "all" ? true :
          filterStatus === "inStock" ? product.inStock : !product.inStock;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchTerm, filterStatus]);

  // Статистик тооцоолох
  const stats = {
    total: products.length,
    inStock: products.filter(p => p.inStock).length,
    outOfStock: products.filter(p => !p.inStock).length
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type }), 3000);
  };

  const handleToggleStock = async (productId: string, currentStockStatus: boolean) => {
    try {
      await updateDoc(doc(db, "products", productId), { inStock: !currentStockStatus });
      setProducts(products.map(p => p.id === productId ? { ...p, inStock: !currentStockStatus } : p));
      showToast("Төлөв шинэчлэгдлээ");
    } catch (error) {
      showToast("Алдаа гарлаа", "error");
    }
  };

  const confirmDelete = async () => {
    try {
      await deleteDoc(doc(db, "products", deleteModal.id));
      setDeleteModal({ isOpen: false, id: "", name: "" });
      showToast("Амжилттай устгагдлаа");
      fetchProducts();
    } catch (error) {
      showToast("Устгахад алдаа гарлаа", "error");
    }
  };

  if (loading) return (
    <div className="p-20 flex justify-center items-center h-full">
      <div className="w-8 h-8 border-2 border-gray-100 border-t-[#1A1A1A] rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

      {/* 1. LIGHTBOX MODAL */}
      {lightbox.isOpen && (
        <div className="fixed inset-0 bg-[#FCFBF9]/95 z-[100] flex items-center justify-center p-8 backdrop-blur-xl">
          <button onClick={() => setLightbox({ ...lightbox, isOpen: false })} className="absolute top-8 right-8 text-[#1A1A1A] bg-white border border-black/[0.05] p-4 rounded-full hover:bg-[#1A1A1A] hover:text-white transition-all shadow-xl"><X size={24} strokeWidth={1.5} /></button>
          {lightbox.images.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-8 md:px-16">
              <button onClick={(e) => { e.stopPropagation(); setLightbox(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length })) }} className="bg-white border border-black/[0.05] p-5 rounded-full text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all shadow-xl"><ChevronLeft size={32} strokeWidth={1.5} /></button>
              <button onClick={(e) => { e.stopPropagation(); setLightbox(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length })) }} className="bg-white border border-black/[0.05] p-5 rounded-full text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition-all shadow-xl"><ChevronRight size={32} strokeWidth={1.5} /></button>
            </div>
          )}
          <img src={lightbox.images[lightbox.index]} className="max-w-full max-h-[80vh] object-contain rounded-[2px] shadow-2xl animate-in zoom-in-95" alt="Preview" />
        </div>
      )}

      {/* 2. HEADER & STATS */}
      <div className="flex flex-col gap-6 font-montserrat">
        <div className="flex items-end justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl lg:text-4xl font-playfair font-medium text-[#1A1A1A]">Inventory</h1>
            <p className="text-[10px] text-[#1A1A1A]/40 font-light uppercase tracking-[0.2em]">Нийт {stats.total} бүтээгдэхүүн</p>
          </div>
          <Link href="/admin/products/add" className="bg-[#1A1A1A] text-white px-8 lg:px-12 py-4 lg:py-5 rounded-[2px] text-[10px] font-medium uppercase tracking-[0.3em] hover:bg-black transition shadow-2xl shadow-black/10">
            + Нэмэх
          </Link>
        </div>

        <div className="flex gap-4">
          <div className="bg-white px-6 py-3 rounded-[2px] border border-black/[0.03] shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-[9px] font-medium text-[#1A1A1A]/60 uppercase tracking-[0.1em]">{stats.inStock} Бэлэн</span>
          </div>
          <div className="bg-white px-6 py-3 rounded-[2px] border border-black/[0.03] shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            <span className="text-[9px] font-medium text-[#1A1A1A]/60 uppercase tracking-[0.1em]">{stats.outOfStock} Дууссан</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#1A1A1A]/20" size={16} />
          <input
            type="text"
            placeholder="Барааны нэрээр хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-black/[0.03] p-5 pl-14 rounded-[2px] outline-none focus:border-[#1A1A1A] transition shadow-sm text-[11px] uppercase tracking-wider font-montserrat"
          />
        </div>
        <div className="flex bg-white border border-black/[0.03] rounded-[2px] p-1.5 shadow-sm">
          {[
            { id: 'all', label: 'Бүгд' },
            { id: 'inStock', label: 'Бэлэн' },
            { id: 'outOfStock', label: 'Дууссан' }
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilterStatus(opt.id)}
              className={`flex-1 lg:flex-none px-8 py-3.5 rounded-[2px] text-[9px] font-medium uppercase tracking-[0.2em] transition-all ${filterStatus === opt.id ? "bg-[#1A1A1A] text-white shadow-xl" : "text-[#1A1A1A]/40 hover:text-[#1A1A1A]"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. PRODUCT LIST */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-[2px] shadow-sm border border-black/[0.03] p-24 text-center">
          <div className="flex flex-col items-center gap-6 text-[#1A1A1A]/10">
            <Package size={48} strokeWidth={1} />
            <p className="font-medium uppercase tracking-[0.3em] text-[10px]">Бараа олдсонгүй</p>
          </div>
        </div>
      ) : (
        <>
          {/* MOBILE: Card Layout */}
          <div className="lg:hidden space-y-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-[2px] border border-black/[0.03] shadow-sm p-4">
                <div className="flex items-center gap-4">
                  <div
                    className="relative cursor-zoom-in shrink-0"
                    onClick={() => setLightbox({ isOpen: true, images: product.imageUrls || [], index: 0 })}
                  >
                    {product.imageUrls?.[0] ? (
                      <img src={product.imageUrls[0]} className="w-16 h-16 object-cover rounded-[2px] border border-black/[0.03]" alt={product.name} />
                    ) : (
                      <div className="w-16 h-16 bg-[#FCFBF9] rounded-[2px] border border-black/[0.03]" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-playfair font-medium text-[#1A1A1A] text-base leading-tight truncate uppercase tracking-tight">{product.name}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      {product.discountedPrice ? (
                        <>
                          <span className="text-[#1A1A1A] font-medium text-[13px]">{product.discountedPrice.toLocaleString()}₮</span>
                          <span className="text-[#1A1A1A]/30 line-through text-[11px] font-light">{product.price.toLocaleString()}₮</span>
                        </>
                      ) : (
                        <span className="text-[#1A1A1A] font-medium text-[13px]">{product.price.toLocaleString()}₮</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                  <button
                    onClick={() => handleToggleStock(product.id!, product.inStock)}
                    className={`px-4 py-2 rounded-[2px] text-[9px] font-medium uppercase tracking-wider transition-all active:scale-95 border ${product.inStock
                      ? "bg-green-50 text-green-600 border-green-100"
                      : "bg-orange-50 text-orange-600 border-orange-100"
                      }`}
                  >
                    {product.inStock ? "• Бэлэн" : "• Дууссан"}
                  </button>
                  <div className="flex gap-2">
                    <Link href={`/admin/products/edit/${product.id}`} className="p-3 bg-[#FCFBF9] text-[#1A1A1A]/40 rounded-[2px] border border-black/[0.03] transition">
                      <Search size={16} strokeWidth={1.5} />
                    </Link>
                    <button onClick={() => setDeleteModal({ isOpen: true, id: product.id!, name: product.name })} className="p-3 bg-red-50 text-red-500 rounded-[2px] border border-red-100 transition">
                      <X size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP: Table Layout */}
          <div className="hidden lg:block bg-white rounded-[2px] shadow-sm border border-black/[0.03] overflow-hidden mt-8">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-[#FCFBF9] text-[#1A1A1A]/30 uppercase text-[9px] font-medium tracking-[0.2em] border-b border-black/[0.03]">
                  <tr>
                    <th className="p-8">Бүтээгдэхүүн</th>
                    <th className="p-8">Категори</th>
                    <th className="p-8 text-center">Төлөв</th>
                    <th className="p-8 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="p-8">
                        <div className="flex items-center gap-6">
                          <div
                            className="relative cursor-zoom-in shrink-0"
                            onClick={() => setLightbox({ isOpen: true, images: product.imageUrls || [], index: 0 })}
                          >
                            {product.imageUrls?.[0] ? (
                              <img src={product.imageUrls[0]} className="w-20 h-20 object-cover rounded-[2px] border border-black/[0.03] shadow-sm" alt={product.name} />
                            ) : (
                              <div className="w-20 h-20 bg-[#FCFBF9] rounded-[2px] border border-black/[0.03]" />
                            )}
                          </div>
                          <div className="space-y-1.5">
                            <p className="font-playfair font-medium text-[#1A1A1A] text-lg leading-none uppercase tracking-tight">{product.name}</p>
                            <div className="flex items-center gap-3">
                              {product.discountedPrice ? (
                                <>
                                  <span className="text-[#1A1A1A] font-medium text-[15px]">{product.discountedPrice.toLocaleString()}₮</span>
                                  <span className="text-[#1A1A1A]/30 line-through text-[11px] font-light">{product.price.toLocaleString()}₮</span>
                                </>
                              ) : (
                                <span className="text-[#1A1A1A] font-medium text-[15px]">{product.price.toLocaleString()}₮</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-8">
                        <div className="flex flex-wrap gap-2">
                          {Array.isArray(product.category) ? product.category.map((cat) => (
                            <span key={cat} className="text-[9px] font-medium text-[#1A1A1A]/40 border border-black/[0.05] px-2.5 py-1.5 rounded-[2px] uppercase tracking-wider">{cat}</span>
                          )) : <span className="text-[9px] font-medium text-[#1A1A1A]/40 border border-black/[0.05] px-2.5 py-1.5 rounded-[2px] uppercase tracking-wider">{product.category}</span>}
                        </div>
                      </td>

                      <td className="p-8 text-center">
                        <button
                          onClick={() => handleToggleStock(product.id!, product.inStock)}
                          className={`px-6 py-2.5 rounded-[2px] text-[9px] font-medium uppercase tracking-[0.1em] transition-all active:scale-95 border ${product.inStock
                            ? "bg-green-50 text-green-600 border-green-100"
                            : "bg-orange-50 text-orange-600 border-orange-100"
                            }`}
                        >
                          {product.inStock ? "• In Stock" : "• Out of Stock"}
                        </button>
                      </td>

                      <td className="p-8 text-right">
                        <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link href={`/admin/products/edit/${product.id}`} className="p-4 bg-[#FCFBF9] text-[#1A1A1A]/40 hover:bg-[#1A1A1A] hover:text-white rounded-[2px] border border-black/[0.03] transition-all">
                            <Search size={18} strokeWidth={1.5} />
                          </Link>
                          <button onClick={() => setDeleteModal({ isOpen: true, id: product.id!, name: product.name })} className="p-4 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-[2px] border border-red-100 transition-all">
                            <X size={18} strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 5. DELETE MODAL & TOAST */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-[#FCFBF9]/80 backdrop-blur-md z-[110] flex items-center justify-center p-8">
          <div className="bg-white rounded-[2px] border border-black/[0.05] shadow-2xl p-12 max-w-sm w-full animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <AlertCircle className="text-red-500" size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-playfair font-medium text-center mb-4 uppercase tracking-tight text-[#1A1A1A]">Устгах уу?</h3>
            <p className="text-[#1A1A1A]/40 text-[10px] text-center mb-10 font-light uppercase tracking-[0.2em] leading-relaxed">
              {deleteModal.name}-ийг системээс бүрмөсөн устгах гэж байна.
            </p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModal({ isOpen: false, id: '', name: '' })} className="flex-1 py-4 bg-[#F3F2F0] rounded-[2px] text-[10px] font-medium uppercase tracking-[0.2em] text-[#1A1A1A]/40 hover:bg-[#1A1A1A] hover:text-white transition-all">Болих</button>
              <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 rounded-[2px] text-[10px] font-medium uppercase tracking-[0.2em] text-white shadow-xl shadow-red-500/20 hover:bg-red-600 transition-all">Устгах</button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST МЭДЭГДЭЛ */}
      {toast.show && (
        <div className={`fixed bottom-12 right-12 px-8 py-5 rounded-[2px] shadow-2xl z-[120] animate-in slide-in-from-bottom-4 border flex items-center gap-4 ${toast.type === "success" ? "bg-[#1A1A1A] text-white border-black" : "bg-red-500 text-white border-red-500"}`}>
          {toast.type === "success" ? <CheckCircle2 size={18} strokeWidth={1.5} /> : <AlertCircle size={18} strokeWidth={1.5} />}
          <span className="text-[10px] font-medium uppercase tracking-[0.2em]">{toast.message}</span>
        </div>
      )}

    </div>
  );
}