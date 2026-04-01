"use client";

import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase"; 
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
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
    if (imageFiles.length === 0) return alert("Зураг заавал оруулна уу!");
    if (selectedCategories.length === 0) return alert("Ангилал сонгоно уу!");
    
    setLoading(true);
    try {
      const uploadPromises = imageFiles.map(async (file) => {
        const imageRef = ref(storage, `products/${Date.now()}_${file.name}`);
        const snap = await uploadBytes(imageRef, file);
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
      alert("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 bg-gray-50 min-h-screen pb-20">
      <div className="flex items-center justify-between mb-8">
        <button onClick={() => router.back()} className="p-2 hover:bg-white rounded-full transition shadow-sm border"><ChevronLeft size={24} /></button>
        <h1 className="text-2xl font-black text-gray-900 tracking-tight italic uppercase">Add New Product</h1>
        <div className="w-10" />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
               Category & Occasion
            </h2>
            <div className="space-y-6">
               {/* 1. Үндсэн Ангилал */}
               <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase mb-3 block ml-1">Үндсэн ангилал</label>
                  <div className="flex flex-wrap gap-2">
                    {dbCategories.map(cat => (
                      <button 
                        key={cat.id} type="button" 
                        onClick={() => toggleItem(selectedCategories, setSelectedCategories, cat.name)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${selectedCategories.includes(cat.name) ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                      >
                        {cat.name === "Бэлэг дурсгал" ? <Gift size={14}/> : <Flower2 size={14}/>}
                        {cat.name}
                      </button>
                    ))}
                  </div>
               </div>

               {/* 2. Зориулалт (ШИНЭ ХЭСЭГ) */}
               <div>
                  <label className="text-[10px] font-bold text-green-600 uppercase mb-3 block ml-1">Зориулалт (Occasions)</label>
                  <div className="flex flex-wrap gap-2">
                    {PURPOSE_OPTIONS.map(purp => (
                      <button 
                        key={purp} type="button" 
                        onClick={() => toggleItem(selectedPurposes, setSelectedPurposes, purp)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${selectedPurposes.includes(purp) ? "bg-green-600 border-green-600 text-white shadow-md shadow-green-100" : "bg-white border-gray-100 text-gray-400 hover:border-green-200"}`}
                      >
                        {selectedPurposes.includes(purp) && <Check size={12} className="mr-1"/>}
                        {purp}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
             <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Зураг</h2>
             <div className="grid grid-cols-4 md:grid-cols-5 gap-4">
                {imageFiles.map((file, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden border shadow-sm">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-lg"><X size={12}/></button>
                  </div>
                ))}
                <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 hover:bg-gray-50 hover:text-green-500 hover:border-green-200 transition-all"><ImagePlus size={24} /></button>
             </div>
             <input type="file" multiple ref={fileInputRef} className="hidden" onChange={(e) => e.target.files && setImageFiles([...imageFiles, ...Array.from(e.target.files)])} />
          </div>

          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="col-span-1 md:col-span-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Бүтээгдэхүүний гарчиг (Нэр)</label>
                <input required type="text" placeholder="Жишээ: 101 Сарнайтай сагс" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-bold outline-none focus:ring-2 focus:ring-black" />
              </div>

              {!isGiftProduct && (
                <div className="col-span-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-green-600 uppercase ml-2">Цэцэгний төрөл</label>
                  <input 
                    list="flower-names" type="text" 
                    placeholder="Сарнай, Алтанзул гэх мэт..." 
                    value={formData.flowerType} 
                    onChange={e => setFormData({...formData, flowerType: e.target.value})} 
                    className="w-full bg-green-50/50 border border-green-100 rounded-2xl p-4 mt-1 font-bold outline-none focus:ring-2 focus:ring-green-500" 
                  />
                  <datalist id="flower-names">
                    {FLOWER_NAME_SUGGESTIONS.map(name => <option key={name} value={name} />)}
                  </datalist>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Үнэ (₮)</label>
                <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-black" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Хямдарсан үнэ (₮)</label>
                <input type="number" value={formData.discountedPrice} onChange={e => setFormData({...formData, discountedPrice: e.target.value})} className="w-full bg-gray-50 border-none rounded-2xl p-4 mt-1 font-black text-rose-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100 space-y-6">
            
            {!isGiftProduct && (
              <>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Савалгаа</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PACKAGING_OPTIONS.map(opt => (
                      <button key={opt} type="button" onClick={() => setFormData({...formData, packaging: opt})} className={`py-3 rounded-xl text-[11px] font-bold transition shadow-sm ${formData.packaging === opt ? "bg-black text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}>{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Тоо ширхэг (Иш)</h3>
                  <input type="number" placeholder="Жишээ: 51" value={formData.stemCount} onChange={e => setFormData({...formData, stemCount: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-black" />
                </div>
              </>
            )}

            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Өнгө сонгох</h3>
              <div className="flex flex-wrap gap-3 p-2 bg-gray-50 rounded-2xl">
                {COLOR_OPTIONS.map(color => (
                  <button 
                    key={color.name} type="button" 
                    onClick={() => toggleItem(selectedColors, setSelectedColors, color.name)}
                    className={`w-8 h-8 rounded-full border-2 shadow-sm transition-transform active:scale-90 ${selectedColors.includes(color.name) ? "border-black scale-110" : "border-transparent hover:scale-105"}`}
                    style={{ background: color.hex }}
                    title={color.name}
                  >
                     {selectedColors.includes(color.name) && <Check size={14} className={color.name === 'Цагаан' ? 'text-black mx-auto' : 'text-white mx-auto'} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Хэмжээ</h3>
              <div className="flex gap-2">
                {SIZE_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => setFormData({...formData, size: s})} className={`flex-1 py-3 rounded-xl text-[11px] font-bold transition ${formData.size === s ? "bg-black text-white" : "bg-gray-50 text-gray-400"}`}>{s}</button>
                ))}
              </div>
            </div>

            <button 
              type="submit" disabled={loading} 
              className="w-full bg-green-600 text-white font-black py-5 rounded-[24px] hover:bg-green-700 transition active:scale-95 disabled:bg-gray-200 shadow-xl shadow-green-100 uppercase tracking-widest text-sm"
            >
              {loading ? "Saving..." : "Save Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}