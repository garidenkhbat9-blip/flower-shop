"use client";

import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
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
      await alert("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="max-w-6xl mx-auto p-8 font-montserrat text-black">
      <div className="flex items-center justify-between mb-12">
        <button onClick={() => router.back()} className="p-4 hover:bg-[#1A1A1A] hover:text-white rounded-[2px] transition-all border border-black/10 bg-white shadow-sm cursor-pointer"><ChevronLeft size={20} strokeWidth={1.5} /></button>
        <h1 className="text-2xl lg:text-4xl font-playfair font-bold text-black">Шинэ бүтээгдэхүүн нэмэх</h1>
        <div className="w-12" />
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">

          <div className="bg-white p-8 rounded-[2px] border border-black/10 shadow-sm">
            <h2 className="text-[10px] font-bold text-black uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
              Ангилал & Зориулалт
            </h2>
            <div className="space-y-10">
              {/* 1. Үндсэн Ангилал */}
              <div>
                <label className="text-[9px] font-bold text-black uppercase tracking-[0.2em] mb-4 block">Үндсэн ангилал</label>
                <div className="flex flex-wrap gap-3">
                  {dbCategories.map(cat => (
                    <button
                      key={cat.id} type="button"
                      onClick={() => toggleItem(selectedCategories, setSelectedCategories, cat.name)}
                      className={`px-6 py-3 rounded-[2px] text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${selectedCategories.includes(cat.name) ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xl" : "bg-white text-black border-black/10 hover:border-[#1A1A1A]"}`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Зориулалт */}
              <div>
                <label className="text-[9px] font-bold text-black uppercase tracking-[0.2em] mb-4 block">Зориулалт (Occasions)</label>
                <div className="flex flex-wrap gap-3">
                  {PURPOSE_OPTIONS.map(purp => (
                    <button
                      key={purp} type="button"
                      onClick={() => toggleItem(selectedPurposes, setSelectedPurposes, purp)}
                      className={`px-6 py-3 rounded-[2px] text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${selectedPurposes.includes(purp) ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xl" : "bg-white text-black border-black/10 hover:border-[#1A1A1A]"}`}
                    >
                      {purp}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2px] border border-black/10 shadow-sm">
            <h2 className="text-[10px] font-bold text-black uppercase tracking-[0.3em] mb-8">Зураг</h2>

            {/* Uploaded Images Grid */}
            {imageFiles.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-8">
                {imageFiles.map((file, i) => (
                  <div key={i} className="relative group aspect-[4/5] rounded-[2px] overflow-hidden border border-black/10 shadow-sm">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                    {i === 0 && (
                      <span className="absolute top-2 left-2 bg-[#1A1A1A]/80 text-white text-[7px] font-bold px-2 py-1 rounded-sm uppercase tracking-widest">Нүүр зураг</span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                    <button
                      type="button"
                      onClick={() => setImageFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-2 right-2 bg-white text-[#1A1A1A] rounded-full p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-[#1A1A1A] hover:text-white cursor-pointer"
                    >
                      <X size={12} strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop Zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#1A1A1A]', 'bg-[#FCFBF9]'); }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-[#1A1A1A]', 'bg-[#FCFBF9]'); }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('border-[#1A1A1A]', 'bg-[#FCFBF9]');
                if (e.dataTransfer.files) setImageFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
              }}
              className={`relative cursor-pointer border border-dashed rounded-[2px] transition-all hover:border-[#1A1A1A] hover:bg-[#FCFBF9] ${imageFiles.length === 0
                  ? 'border-black/20 py-20'
                  : 'border-black/20 py-10'
                }`}
            >
              <div className="flex flex-col items-center justify-center gap-4 text-center px-6">
                <div className={`rounded-full flex items-center justify-center transition-all ${imageFiles.length === 0
                    ? 'w-20 h-20 bg-[#F3F2F0] text-black'
                    : 'w-12 h-12 bg-[#F3F2F0] text-black'
                  }`}>
                  <ImagePlus size={imageFiles.length === 0 ? 32 : 20} strokeWidth={1.5} />
                </div>
                {imageFiles.length === 0 ? (
                  <>
                    <div>
                      <p className="text-[11px] font-bold text-black uppercase tracking-[0.1em]">Зураг чирж оруулах эсвэл дарна уу</p>
                      <p className="text-[9px] text-black mt-2 uppercase tracking-widest font-semibold">PNG, JPG, WEBP — Олон зураг зэрэг сонгох боломжтой</p>
                    </div>
                    <span className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white text-[9px] font-bold uppercase tracking-[0.2em] px-8 py-4 rounded-[2px] hover:bg-black transition shadow-xl mt-4 cursor-pointer">
                      <ImagePlus size={14} strokeWidth={1.5} /> Зураг сонгох
                    </span>
                  </>
                ) : (
                  <p className="text-[9px] text-black font-bold uppercase tracking-widest">
                    + Нэмэлт зураг оруулах <span className="text-black/80">({imageFiles.length} зургууд)</span>
                  </p>
                )}
              </div>
            </div>
            <input
              type="file"
              multiple
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={(e) => e.target.files && setImageFiles([...imageFiles, ...Array.from(e.target.files)])}
            />
          </div>

          <div className="bg-white p-8 rounded-[2px] border border-black/10 shadow-sm space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="col-span-1 md:col-span-2">
                <label className="text-[9px] font-bold text-black uppercase tracking-[0.2em] mb-4 block">Бүтээгдэхүүний гарчиг (Нэр)</label>
                <input required type="text" placeholder="Жишээ: 101 Сарнайтай сагс" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#FCFBF9] border border-black/10 rounded-[2px] p-5 font-playfair text-lg text-black font-bold outline-none focus:border-[#1A1A1A] transition-all" />
              </div>

              {!isGiftProduct && (
                <div className="col-span-1 md:col-span-2">
                  <label className="text-[9px] font-bold text-black uppercase tracking-[0.2em] mb-4 block">Цэцэгний төрөл</label>
                  <input
                    list="flower-names" type="text"
                    placeholder="Сарнай, Алтанзул гэх мэт..."
                    value={formData.flowerType}
                    onChange={e => setFormData({ ...formData, flowerType: e.target.value })}
                    className="w-full bg-[#FCFBF9] border border-black/10 rounded-[2px] p-5 text-[11px] text-black font-semibold uppercase tracking-wider outline-none focus:border-[#1A1A1A] transition-all"
                  />
                  <datalist id="flower-names">
                    {FLOWER_NAME_SUGGESTIONS.map(name => <option key={name} value={name} />)}
                  </datalist>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div>
                <label className="text-[9px] font-bold text-black uppercase tracking-[0.2em] mb-4 block">Үнэ (₮)</label>
                <input required type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} className="w-full bg-[#FCFBF9] border border-black/10 rounded-[2px] p-5 font-playfair text-xl text-black font-bold outline-none focus:border-[#1A1A1A] transition-all" />
              </div>
              <div>
                <label className="text-[9px] font-bold text-black uppercase tracking-[0.2em] mb-4 block">Хямдарсан үнэ (₮)</label>
                <input type="number" value={formData.discountedPrice} onChange={e => setFormData({ ...formData, discountedPrice: e.target.value })} className="w-full bg-[#FCFBF9] border border-black/10 rounded-[2px] p-5 font-playfair text-xl text-rose-700 font-bold outline-none focus:border-[#1A1A1A] transition-all" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-[2px] border border-black/10 shadow-sm space-y-10">

            {!isGiftProduct && (
              <>
                <div>
                  <h3 className="text-[9px] font-bold text-black uppercase tracking-[0.2em] mb-4">Савалгаа</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {PACKAGING_OPTIONS.map(opt => (
                      <button key={opt} type="button" onClick={() => setFormData({ ...formData, packaging: opt })} className={`py-4 rounded-[2px] text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${formData.packaging === opt ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xl" : "bg-white text-black border-black/10 hover:border-[#1A1A1A]"}`}>{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[9px] font-bold text-black uppercase tracking-[0.2em] mb-4">Тоо ширхэг (Иш)</h3>
                  <input type="number" placeholder="Жишээ: 51" value={formData.stemCount} onChange={e => setFormData({ ...formData, stemCount: e.target.value })} className="w-full bg-[#FCFBF9] border border-black/10 rounded-[2px] p-5 text-sm font-playfair font-bold text-black outline-none focus:border-[#1A1A1A]" />
                </div>
              </>
            )}

            <div>
              <h3 className="text-[9px] font-bold text-black uppercase tracking-[0.2em] mb-4">Өнгө сонгох</h3>
              <div className="flex flex-wrap gap-4 p-4 bg-[#FCFBF9] rounded-[2px] border border-black/10">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color.name} type="button"
                    onClick={() => toggleItem(selectedColors, setSelectedColors, color.name)}
                    className={`w-10 h-10 rounded-full border-2 transition-all active:scale-90 cursor-pointer ${selectedColors.includes(color.name) ? "border-[#1A1A1A] scale-110 shadow-lg" : "border-transparent hover:scale-105"}`}
                    style={{ background: color.hex }}
                    title={color.name}
                  >
                    {selectedColors.includes(color.name) && <Check size={16} className={color.name === 'Цагаан' ? 'text-black mx-auto' : 'text-white mx-auto'} strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[9px] font-bold text-black uppercase tracking-[0.2em] mb-4">Хэмжээ</h3>
              <div className="flex gap-3">
                {SIZE_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => setFormData({ ...formData, size: s })} className={`flex-1 py-4 rounded-[2px] text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${formData.size === s ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xl" : "bg-white text-black border-black/10 hover:border-[#1A1A1A]"}`}>{s}</button>
                ))}
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-[#1A1A1A] text-white font-bold py-6 rounded-[2px] hover:bg-black transition-all active:scale-95 disabled:bg-gray-300 shadow-2xl shadow-black/10 uppercase tracking-[0.3em] text-[11px] cursor-pointer"
            >
              {loading ? "Хадгалж байна..." : "Хадгалах"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}