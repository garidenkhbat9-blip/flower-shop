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
      <div className="w-10 h-10 border-4 border-gray-100 border-t-black rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      
      {/* 1. LIGHTBOX MODAL */}
      {lightbox.isOpen && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <button onClick={() => setLightbox({ ...lightbox, isOpen: false })} className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition"><X size={24} /></button>
          {lightbox.images.length > 1 && (
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 md:px-12">
              <button onClick={(e) => { e.stopPropagation(); setLightbox(prev => ({ ...prev, index: (prev.index - 1 + prev.images.length) % prev.images.length })) }} className="bg-white/10 p-4 rounded-full text-white hover:bg-white/20"><ChevronLeft size={32} /></button>
              <button onClick={(e) => { e.stopPropagation(); setLightbox(prev => ({ ...prev, index: (prev.index + 1) % prev.images.length })) }} className="bg-white/10 p-4 rounded-full text-white hover:bg-white/20"><ChevronRight size={32} /></button>
            </div>
          )}
          <img src={lightbox.images[lightbox.index]} className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95" alt="Preview" />
        </div>
      )}

      {/* 2. HEADER & STATS */}
      <div className="flex flex-col gap-4">
        <div className="flex items-end justify-between">
          <div className="space-y-0.5">
            <h1 className="text-2xl lg:text-4xl font-black text-gray-900 tracking-tighter italic uppercase">Inventory</h1>
            <p className="text-gray-400 text-xs lg:text-sm font-medium">Нийт {stats.total} бүтээгдэхүүн</p>
          </div>
          <Link href="/admin/products/add" className="bg-black text-white px-5 lg:px-8 py-2.5 lg:py-3 rounded-2xl lg:rounded-[24px] text-sm font-bold hover:opacity-90 transition shadow-xl shadow-black/10">
            + Нэмэх
          </Link>
        </div>
        
        <div className="flex gap-2 lg:gap-4">
          <div className="bg-white px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase">{stats.inStock} Бэлэн</span>
          </div>
          <div className="bg-white px-3 lg:px-5 py-2 lg:py-3 rounded-xl lg:rounded-[24px] border border-gray-100 shadow-sm flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-[10px] lg:text-xs font-bold text-gray-500 uppercase">{stats.outOfStock} Дууссан</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER BAR */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text" 
            placeholder="Барааны нэрээр хайх..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-gray-100 p-3 lg:p-4 pl-11 lg:pl-12 rounded-xl lg:rounded-[24px] outline-none focus:ring-2 focus:ring-black/5 transition shadow-sm text-sm"
          />
        </div>
        <div className="flex bg-white border border-gray-100 rounded-xl lg:rounded-[24px] p-1 shadow-sm">
          {[
            {id: 'all', label: 'Бүгд'},
            {id: 'inStock', label: 'Бэлэн'},
            {id: 'outOfStock', label: 'Дууссан'}
          ].map((opt) => (
            <button
              key={opt.id}
              onClick={() => setFilterStatus(opt.id)}
              className={`flex-1 lg:flex-none px-4 lg:px-6 py-2.5 lg:py-3 rounded-lg lg:rounded-[20px] text-xs font-bold transition-all ${filterStatus === opt.id ? "bg-black text-white" : "text-gray-400 hover:text-gray-600"}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. PRODUCT LIST */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl lg:rounded-[40px] shadow-sm border border-gray-100 p-16 text-center">
          <div className="flex flex-col items-center gap-2 text-gray-300">
            <Package size={48} strokeWidth={1} />
            <p className="font-bold uppercase tracking-widest text-xs">Бараа олдсонгүй</p>
          </div>
        </div>
      ) : (
        <>
          {/* MOBILE: Card Layout */}
          <div className="lg:hidden space-y-3">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
                <div className="flex items-center gap-3">
                  <div 
                    className="relative cursor-zoom-in shrink-0" 
                    onClick={() => setLightbox({ isOpen: true, images: product.imageUrls || [], index: 0 })}
                  >
                    {product.imageUrls?.[0] ? (
                      <img src={product.imageUrls[0]} className="w-12 h-12 object-cover rounded-xl border border-gray-100" alt={product.name} />
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-xl border border-dashed border-gray-200" />
                    )}
                    {product.imageUrls?.length > 1 && (
                      <span className="absolute -top-1 -right-1 bg-black text-white text-[7px] font-bold px-1 py-0.5 rounded-full border border-white">
                        +{product.imageUrls.length - 1}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-gray-800 text-sm leading-tight truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {product.discountedPrice ? (
                        <>
                          <span className="text-red-500 font-bold text-xs">{product.discountedPrice.toLocaleString()}₮</span>
                          <span className="text-gray-300 line-through text-[10px]">{product.price.toLocaleString()}₮</span>
                        </>
                      ) : (
                        <span className="text-gray-500 font-bold text-xs">{product.price.toLocaleString()}₮</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-gray-50">
                  <button 
                    onClick={() => handleToggleStock(product.id!, product.inStock)}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tight transition-all active:scale-95 border ${
                      product.inStock 
                      ? "bg-green-50 text-green-600 border-green-100" 
                      : "bg-red-50 text-red-500 border-red-100"
                    }`}
                  >
                    {product.inStock ? "• Бэлэн" : "• Дууссан"}
                  </button>
                  <div className="flex gap-1.5">
                    <Link href={`/admin/products/edit/${product.id}`} className="p-2 bg-gray-50 text-gray-500 rounded-lg transition">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                    </Link>
                    <button onClick={() => setDeleteModal({ isOpen: true, id: product.id!, name: product.name })} className="p-2 bg-red-50 text-red-400 rounded-lg transition">
                       <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP: Table Layout */}
          <div className="hidden lg:block bg-white rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-50">
                  <tr>
                    <th className="p-6">Бүтээгдэхүүн</th>
                    <th className="p-6">Категори</th>
                    <th className="p-6 text-center">Төлөв</th>
                    <th className="p-6 text-right">Үйлдэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredProducts.map(product => (
                    <tr key={product.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="p-6">
                        <div className="flex items-center gap-5">
                          <div 
                            className="relative cursor-zoom-in shrink-0" 
                            onClick={() => setLightbox({ isOpen: true, images: product.imageUrls || [], index: 0 })}
                          >
                            {product.imageUrls?.[0] ? (
                              <img src={product.imageUrls[0]} className="w-16 h-16 object-cover rounded-2xl border border-gray-100 shadow-sm" alt={product.name} />
                            ) : (
                              <div className="w-16 h-16 bg-gray-100 rounded-2xl border border-dashed border-gray-200" />
                            )}
                            {product.imageUrls?.length > 1 && (
                              <span className="absolute -top-2 -right-2 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">
                                +{product.imageUrls.length - 1}
                              </span>
                            )}
                          </div>
                          <div className="space-y-1">
                            <p className="font-black text-gray-800 text-base leading-none">{product.name}</p>
                            <div className="flex items-center gap-2">
                              {product.discountedPrice ? (
                                <>
                                  <span className="text-red-500 font-bold text-sm">{product.discountedPrice.toLocaleString()}₮</span>
                                  <span className="text-gray-300 line-through text-[10px]">{product.price.toLocaleString()}₮</span>
                                </>
                              ) : (
                                <span className="text-gray-500 font-bold text-sm">{product.price.toLocaleString()}₮</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-6">
                        <div className="flex flex-wrap gap-1.5">
                         {Array.isArray(product.category) ? product.category.map((cat) => (
                            <span key={cat} className="text-[10px] font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded-full">{cat}</span>
                         )) : <span className="text-[10px] font-bold bg-gray-50 text-gray-500 px-2 py-1 rounded-full">{product.category}</span>}
                        </div>
                      </td>

                      <td className="p-6 text-center">
                        <button 
                          onClick={() => handleToggleStock(product.id!, product.inStock)}
                          className={`px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-tighter transition-all active:scale-95 border ${
                            product.inStock 
                            ? "bg-green-50 text-green-600 border-green-100" 
                            : "bg-red-50 text-red-500 border-red-100"
                          }`}
                        >
                          {product.inStock ? "• In Stock" : "• Out of Stock"}
                        </button>
                      </td>

                      <td className="p-6 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/products/edit/${product.id}`} className="p-3 bg-gray-50 text-gray-400 hover:text-black rounded-2xl transition">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                          </Link>
                          <button onClick={() => setDeleteModal({ isOpen: true, id: product.id!, name: product.name })} className="p-3 bg-gray-50 text-gray-400 hover:text-red-500 rounded-2xl transition">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
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

      {/* 5. DELETE MODAL & TOAST (Таны хуучин код шиг хэвээрээ ажиллана) */}
      {/* ... DELETE MODAL КОД ... */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
           {/* Дээрх таны устгах модал кодыг энд байрлуулна */}
           <div className="bg-white rounded-[40px] shadow-2xl p-10 max-w-sm w-full animate-in zoom-in-95">
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">⚠️</div>
              <h3 className="text-xl font-black text-center mb-2 uppercase">Устгах уу?</h3>
              <p className="text-gray-400 text-sm text-center mb-8">{deleteModal.name}-ийг системээс бүрмөсөн устгах гэж байна.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteModal({isOpen: false, id: '', name: ''})} className="flex-1 py-4 bg-gray-100 rounded-3xl font-bold text-gray-500">Болих</button>
                <button onClick={confirmDelete} className="flex-1 py-4 bg-red-500 rounded-3xl font-bold text-white shadow-lg shadow-red-100">Устгах</button>
              </div>
           </div>
        </div>
      )}

      {/* TOAST МЭДЭГДЭЛ */}
      {toast.show && (
        <div className={`fixed bottom-8 right-8 px-6 py-4 rounded-[24px] shadow-2xl z-[120] animate-in slide-in-from-bottom-4 border flex items-center gap-3 ${toast.type === "success" ? "bg-black text-white border-black" : "bg-red-500 text-white border-red-500"}`}>
          {toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span className="text-xs font-bold uppercase tracking-wider">{toast.message}</span>
        </div>
      )}
    </div>
  );
}