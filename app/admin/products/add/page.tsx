"use client";

import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { compressImage } from "@/lib/imageUtils";
import { useRouter } from "next/navigation";
import { useAdminDialog } from "@/context/AdminDialogContext";
import { ChevronLeft, ImagePlus, X, Check, Flower2, Gift, Heart, Info, Target } from "lucide-react";

// Зөвхөн үндсэн 4 савалгааг үлдээв
const PACKAGING_OPTIONS = ["Баглаа", "Хайрцагтай", "Сагстай", "Хөрстэй"];

const SIZE_OPTIONS = ["Жижиг", "Дунд", "Том"];
const COLOR_OPTIONS = [
  { name: "Улаан", hex: "#E11D48" }, { name: "Ягаан", hex: "#FB7185" },
  { name: "Цагаан", hex: "#FFFFFF" }, { name: "Шар", hex: "#FACC15" },
  { name: "Улбар шар", hex: "#FB923C" }, { name: "Хөх", hex: "#2563EB" },
  { name: "Солонго", hex: "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)" }
];

// Зураг дээрх зориулалтын сонголтууд
const PURPOSE_OPTIONS = ["Хайрт ээждээ", "Хайраа илчлэх", "Уучлалт гуйх", "Баяр хүргэх", "Ойн баяр", "Төрсөн өдөр"];

const FLOWER_NAME_SUGGESTIONS = ["Сарнай", "Сараана", "Ромашка", "Башир", "Алтанзул", "Барын чих", "Наранцэцэг"];

export default function AddProductPage() {
  const router = useRouter();
  const { alert } = useAdminDialog();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [dbCategories, setDbCategories] = useState<any[]>([]);

  // Form States
  const [formData, setFormData] = useState({
    name: "", price: "", discountedPrice: "", description: "", careInstructions: "",
    flowerType: "", packaging: "Баглаа", size: "Дунд", stemCount: ""
  });

  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]); // Зориулалт хадгалах
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const isGiftProduct = selectedCategories.includes("Бэлэг дурсгал") || selectedCategories.includes("Бялуу");

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("name", "asc"));
    return onSnapshot(q, (snap) => {
      setDbCategories(snap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));
    });
  }, []);

  const toggleItem = (list: string[], setList: any, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imageFiles.length === 0) {
      await alert("Зураг заавал оруулна уу!");
      return;
    }
    if (selectedCategories.length === 0) {
      await alert("Ангилал сонгоно уу!");
      return;
    }

    setLoading(true);
    try {
      const uploadPromises = imageFiles.map(async (file) => {
        // Зургийг байршуулахаас өмнө шахах
        const compressedFile = await compressImage(file);
        const imageRef = ref(storage, `products/${Date.now()}_${compressedFile.name}`);
        const snap = await uploadBytes(imageRef, compressedFile);
        return getDownloadURL(snap.ref);
      });
      const imageUrls = await Promise.all(uploadPromises);

      await addDoc(collection(db, "products"), {
        ...formData,
        price: Number(formData.price),
        discountedPrice: formData.discountedPrice ? Number(formData.discountedPrice) : null,
        stemCount: isGiftProduct ? null : (Number(formData.stemCount) || null),
        colors: selectedColors,
        categories: selectedCategories,
        purposes: selectedPurposes, // Зориулалт хадгалах
        imageUrls,
        inStock: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      await alert("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 font-sans text-gray-900 pb-32">
      <div className="flex items-center gap-4 mb-6 md:mb-10 lg:mt-0">
        <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm cursor-pointer text-gray-600 shrink-0">
          <ChevronLeft size={20} />
        </button>
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-gray-800 line-clamp-1">Бүтээгдэхүүн нэмэх</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. Basic Info */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-4">
              <Info size={18} className="text-gray-400"/> Үндсэн мэдээлэл
            </h2>
            
            <div>
              <label className="text-[13px] font-semibold text-gray-700 mb-2 block">Бүтээгдэхүүний нэр <span className="text-red-500">*</span></label>
              <input required type="text" placeholder="Жишээ: 101 Сарнайтай сагс" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" />
            </div>

            {!isGiftProduct && (
              <div>
                <label className="text-[13px] font-semibold text-gray-700 mb-2 block">Цэцэгний төрөл</label>
                <input list="flower-names" type="text" placeholder="Сарнай, Алтанзул гэх мэт..." value={formData.flowerType} onChange={e => setFormData({ ...formData, flowerType: e.target.value })} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" />
                <datalist id="flower-names">
                  {FLOWER_NAME_SUGGESTIONS.map(name => <option key={name} value={name} />)}
                </datalist>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="text-[13px] font-semibold text-gray-700 mb-2 block">Үнэ (₮) <span className="text-red-500">*</span></label>
                <input required type="number" placeholder="0" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-gray-800 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" />
              </div>
              <div>
                <label className="text-[13px] font-semibold text-gray-700 mb-2 block">Хямдарсан үнэ (₮)</label>
                <input type="number" placeholder="Сонголттой" value={formData.discountedPrice} onChange={e => setFormData({ ...formData, discountedPrice: e.target.value })} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-medium text-red-600 outline-none focus:bg-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all placeholder-gray-400" />
              </div>
            </div>
          </div>

          {/* 2. Categories & Purposes */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-50 pb-4">
              <Target size={18} className="text-gray-400"/> Ангилал & Зориулалт
            </h2>
            
            <div className="mb-6">
              <label className="text-[13px] font-semibold text-gray-700 mb-3 block">Үндсэн ангилал <span className="text-red-500">*</span></label>
              <div className="flex flex-wrap gap-2.5">
                {dbCategories.map(cat => (
                  <button key={cat.id} type="button" onClick={() => toggleItem(selectedCategories, setSelectedCategories, cat.name)} className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all border cursor-pointer ${selectedCategories.includes(cat.name) ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[13px] font-semibold text-gray-700 mb-3 block">Зориулалт (Occasions)</label>
              <div className="flex flex-wrap gap-2.5">
                {PURPOSE_OPTIONS.map(purp => (
                  <button key={purp} type="button" onClick={() => toggleItem(selectedPurposes, setSelectedPurposes, purp)} className={`px-4 py-2 rounded-full text-[12px] font-medium transition-all border cursor-pointer ${selectedPurposes.includes(purp) ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"}`}>
                    {purp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Images */}
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-sm font-bold text-gray-800 mb-5 flex items-center gap-2 border-b border-gray-50 pb-4">
              <ImagePlus size={18} className="text-gray-400"/> Бүтээгдэхүүний зураг <span className="text-red-500">*</span>
            </h2>

            {imageFiles.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
                {imageFiles.map((file, i) => (
                  <div key={i} className="relative group aspect-[4/5] rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-black/70 backdrop-blur-md text-white text-[10px] font-medium px-2 py-1 rounded-md shadow-sm">Нүүр зураг</span>
                    )}
                    <button type="button" onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-2 right-2 bg-white/90 text-red-500 rounded-full p-2 shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-red-50 hover:scale-110 cursor-pointer">
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div onClick={() => fileInputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-black', 'bg-gray-50'); }} onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-black', 'bg-gray-50'); }} onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-black', 'bg-gray-50'); if (e.dataTransfer.files) setImageFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]); }} className={`relative cursor-pointer border-2 border-dashed rounded-xl transition-all flex flex-col items-center justify-center text-center ${imageFiles.length === 0 ? 'border-gray-300 py-16 hover:bg-gray-50 hover:border-gray-400' : 'border-gray-200 py-8 hover:bg-gray-50 hover:border-gray-400'}`}>
              <div className="w-14 h-14 bg-gray-100 text-gray-500 rounded-full flex items-center justify-center mb-3">
                <ImagePlus size={24} />
              </div>
              <p className="text-[14px] font-semibold text-gray-800 mb-1">Зураг оруулах</p>
              <p className="text-[12px] text-gray-400 tracking-wide">Энд чирж оруулах эсвэл дарна уу</p>
            </div>
            <input type="file" multiple accept="image/*" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && setImageFiles([...imageFiles, ...Array.from(e.target.files)])} />
          </div>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6 lg:sticky lg:top-24">
            
            {!isGiftProduct && (
              <>
                <div>
                  <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Савалгаа</h3>
                  <div className="grid grid-cols-2 gap-2.5">
                    {PACKAGING_OPTIONS.map(opt => (
                      <button key={opt} type="button" onClick={() => setFormData({ ...formData, packaging: opt })} className={`py-2.5 rounded-xl text-[12px] font-medium transition-all border cursor-pointer ${formData.packaging === opt ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>{opt}</button>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <h3 className="text-[13px] font-semibold text-gray-700 mb-3">Тоо ширхэг (Иш)</h3>
                  <input type="number" placeholder="Жишээ: 51" value={formData.stemCount} onChange={e => setFormData({ ...formData, stemCount: e.target.value })} className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:bg-white focus:border-black focus:ring-1 focus:ring-black transition-all" />
                </div>
              </>
            )}

            <div>
              <h3 className="text-[13px] font-semibold text-gray-700 mb-3 border-t border-gray-100 pt-6">Өнгө сонгох</h3>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map(color => (
                  <button key={color.name} type="button" onClick={() => toggleItem(selectedColors, setSelectedColors, color.name)} className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center shadow-sm ${selectedColors.includes(color.name) ? "border-gray-800 scale-110 ring-2 ring-offset-1 ring-gray-100" : "border-transparent hover:scale-110"}`} style={{ background: color.hex }} title={color.name}>
                    {selectedColors.includes(color.name) && <Check size={16} className={color.name === 'Цагаан' ? 'text-black' : 'text-white'} strokeWidth={3} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[13px] font-semibold text-gray-700 mb-3 border-t border-gray-100 pt-6">Хэмжээ</h3>
              <div className="grid grid-cols-3 gap-2.5">
                {SIZE_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => setFormData({ ...formData, size: s })} className={`py-2 rounded-xl text-[12px] font-medium transition-all border cursor-pointer ${formData.size === s ? "bg-black text-white border-black shadow-md" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>{s}</button>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-2 border-t border-gray-100">
              <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 bg-[#87A96B] text-white font-bold py-4 rounded-xl hover:bg-[#739458] transition-all active:scale-95 disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg shadow-[#87A96B]/20 uppercase tracking-widest text-[12px] cursor-pointer">
                {loading ? "Түр хүлээнэ үү..." : <><Check size={18} /> Хадгалах</>}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}