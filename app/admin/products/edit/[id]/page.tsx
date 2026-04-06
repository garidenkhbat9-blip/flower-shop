"use client";

import { useEffect, useState, use } from "react"; 
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { Check, Tag, Flower2, Gift } from "lucide-react";

const PACKAGING_OPTIONS = ["Баглаа", "Хайрцагтай", "Сагстай", "Хөрстэй"];
const SIZE_OPTIONS = ["Жижиг", "Дунд", "Том"];
const COLOR_OPTIONS = [
  { name: "Улаан", hex: "#E11D48" }, { name: "Ягаан", hex: "#FB7185" },
  { name: "Цагаан", hex: "#FFFFFF" }, { name: "Шар", hex: "#FACC15" },
  { name: "Улбар шар", hex: "#FB923C" }, { name: "Хөх", hex: "#2563EB" },
  { name: "Солонго", hex: "linear-gradient(to right, red, orange, yellow, green, blue, indigo, violet)" }
];
const PURPOSE_OPTIONS = ["Хайрт ээждээ", "Хайраа илчлэх", "Уучлалт гуйх", "Баяр хүргэх", "Ойн баяр", "Төрсөн өдөр"];
const FLOWER_NAME_SUGGESTIONS = ["Сарнай", "Сараана", "Ромашка", "Башир", "Алтанзул", "Барын чих", "Наранцэцэг"];

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params); 

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [dbCategories, setDbCategories] = useState<any[]>([]); // Бүх категориуд
  
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    discountedPrice: "",
    categories: [] as string[],
    inStock: true,
    imageUrls: [] as string[],
    flowerType: "",
    packaging: "Баглаа",
    size: "Дунд",
    stemCount: ""
  });
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPurposes, setSelectedPurposes] = useState<string[]>([]);
  
  const isGiftProduct = formData.categories.includes("Бэлэг дурсгал") || formData.categories.includes("Бялуу");

  const toggleItem = (list: string[], setList: any, item: string) => {
    setList(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // 1. Бүх категориудыг татах
        const catSnap = await getDocs(query(collection(db, "categories"), orderBy("name", "asc")));
        setDbCategories(catSnap.docs.map(doc => ({ id: doc.id, name: doc.data().name })));

        // 2. Бүтээгдэхүүний мэдээллийг татах
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          
          // Хэрэв хуучин дата 'category' (string) бол 'categories' (array) болгож хөрвүүлнэ
          let categoriesArray = [];
          if (Array.isArray(data.categories)) {
            categoriesArray = data.categories;
          } else if (typeof data.category === 'string') {
            categoriesArray = [data.category];
          }

          setFormData({
            name: data.name || "",
            price: data.price?.toString() || "",
            discountedPrice: data.discountedPrice?.toString() || "",
            categories: categoriesArray,
            inStock: data.inStock !== undefined ? data.inStock : true,
            imageUrls: data.imageUrls || [],
            flowerType: data.flowerType || "",
            packaging: data.packaging || "Баглаа",
            size: data.size || "Дунд",
            stemCount: data.stemCount?.toString() || "",
          });
          setSelectedColors(data.colors || []);
          setSelectedPurposes(data.purposes || []);
        } else {
          router.push("/admin/products");
        }
      } catch (error) {
        console.error("Дата татахад алдаа:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [id, router]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Категори сонгох/хасах
  const toggleCategory = (catName: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(catName)
        ? prev.categories.filter(c => c !== catName)
        : [...prev.categories, catName]
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setNewImageFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeExistingImage = (indexToRemove: number) => {
    setFormData(prev => ({
      ...prev,
      imageUrls: prev.imageUrls.filter((_, index) => index !== indexToRemove)
    }));
  };

  const removeNewImage = (indexToRemove: number) => {
    setNewImageFiles(prev => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let finalImageUrls = [...formData.imageUrls];

      if (newImageFiles.length > 0) {
        const uploadPromises = newImageFiles.map(async (file) => {
          const imageRef = ref(storage, `products/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(imageRef, file);
          return getDownloadURL(snapshot.ref);
        });
        const newUploadedUrls = await Promise.all(uploadPromises);
        finalImageUrls = [...finalImageUrls, ...newUploadedUrls];
      }

      const updatedData = {
        name: formData.name,
        price: Number(formData.price),
        discountedPrice: formData.discountedPrice ? Number(formData.discountedPrice) : null,
        categories: formData.categories,
        imageUrls: finalImageUrls, 
        inStock: formData.inStock,
        flowerType: isGiftProduct ? null : formData.flowerType,
        packaging: isGiftProduct ? "Хайрцагтай" : formData.packaging,
        size: formData.size,
        stemCount: isGiftProduct ? null : (Number(formData.stemCount) || null),
        colors: selectedColors,
        purposes: selectedPurposes,
        updatedAt: serverTimestamp(),
      };

      await updateDoc(doc(db, "products", id), updatedData);
      
      setShowSuccess(true);
      setTimeout(() => router.push("/admin/products"), 2000);

    } catch (error) {
      console.error("Алдаа:", error);
      alert("Хадгалахад алдаа гарлаа.");
      setSaving(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto pb-24 font-sans">
      
      {showSuccess && (
        <div className="fixed top-8 right-8 bg-white border-l-4 border-green-500 shadow-xl p-4 rounded-r-lg flex items-center gap-4 z-50 animate-bounce">
          <div className="bg-green-100 p-2 rounded-full"><Check size={20} className="text-green-600"/></div>
          <div>
            <h3 className="font-bold text-gray-800 text-sm">Амжилттай хадгалагдлаа!</h3>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-800 text-2xl transition">←</button>
        <h1 className="text-2xl font-black text-gray-800 uppercase tracking-tighter italic">Засварлах</h1>
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ЗҮҮН ТАЛ: ЗУРАГ БОЛОН ҮНДСЭН МЭДЭЭЛЭЛ */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Зураг</h2>
            
            {/* Uploaded Images Grid */}
            {(formData.imageUrls.length > 0 || newImageFiles.length > 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {/* Existing Images */}
                {formData.imageUrls.map((url, index) => (
                  <div key={`exist-${index}`} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    {index === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Нүүр</span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <button 
                      type="button" 
                      onClick={() => removeExistingImage(index)} 
                      className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                
                {/* New Images */}
                {newImageFiles.map((file, index) => (
                  <div key={`new-${index}`} className="relative group aspect-square rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                    {formData.imageUrls.length === 0 && index === 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-black/70 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase">Нүүр</span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <button 
                      type="button" 
                      onClick={() => removeNewImage(index)} 
                      className="absolute top-1.5 right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop Zone */}
            <div 
              onClick={() => document.getElementById('edit-image-upload')?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#E2A9BE]', 'bg-[#E2A9BE]/10'); }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-[#E2A9BE]', 'bg-[#E2A9BE]/10'); }}
              onDrop={(e) => { 
                e.preventDefault(); 
                e.currentTarget.classList.remove('border-[#E2A9BE]', 'bg-[#E2A9BE]/10');
                if (e.dataTransfer.files) {
                  const filesArray = Array.from(e.dataTransfer.files);
                  setNewImageFiles(prev => [...prev, ...filesArray]);
                }
              }}
              className={`relative cursor-pointer border-2 border-dashed rounded-2xl transition-all hover:border-[#E2A9BE] hover:bg-[#E2A9BE]/5 ${
                (formData.imageUrls.length === 0 && newImageFiles.length === 0) 
                  ? 'border-gray-200 py-16' 
                  : 'border-gray-100 py-6 mt-4'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-3 text-center px-4">
                <div className={`rounded-full flex items-center justify-center transition-all ${
                  (formData.imageUrls.length === 0 && newImageFiles.length === 0) 
                    ? 'w-16 h-16 bg-[#E2A9BE]/20 text-[#E2A9BE]' 
                    : 'w-10 h-10 bg-gray-100 text-gray-400'
                }`}>
                  <span className="text-2xl text-current">+</span>
                </div>
                {(formData.imageUrls.length === 0 && newImageFiles.length === 0) ? (
                  <>
                    <div>
                      <p className="text-sm font-bold text-gray-700">Зураг чирж оруулах эсвэл дарна уу</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP — олон зураг нэг дор сонгож болно</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 bg-[#333333] text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-black transition mt-1">
                      + Зураг сонгох
                    </span>
                  </>
                ) : (
                  <p className="text-xs text-gray-400 font-medium">
                    + Нэмэлт зураг оруулах <span className="text-gray-300">({formData.imageUrls.length + newImageFiles.length} зураг байна)</span>
                  </p>
                )}
              </div>
            </div>
            
            <input 
              id="edit-image-upload"
              type="file" 
              multiple 
              accept="image/*"
              className="hidden" 
              onChange={handleImageSelect} 
            />
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Мэдээлэл</h2>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Жишээ: 101 Сарнайтай сагс" className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold" />
            
            {!isGiftProduct && (
              <div className="mt-4">
                <label className="text-[10px] font-bold text-[#87A96B] uppercase ml-2">Цэцэгний төрөл</label>
                <input 
                  list="flower-names" type="text" name="flowerType"
                  placeholder="Сарнай, Алтанзул гэх мэт..." 
                  value={formData.flowerType} 
                  onChange={handleChange} 
                  className="w-full bg-[#87A96B]/10 border border-[#87A96B]/20 rounded-xl p-4 mt-1 font-bold outline-none focus:ring-2 focus:ring-[#87A96B]" 
                />
                <datalist id="flower-names">
                  {FLOWER_NAME_SUGGESTIONS.map(name => <option key={name} value={name} />)}
                </datalist>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Үнэ (₮)</label>
                <input required type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Үнэ (₮)" className="w-full bg-gray-50 border-none rounded-xl p-4 font-black mt-1" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-2">Хямдарсан (₮)</label>
                <input type="number" name="discountedPrice" value={formData.discountedPrice} onChange={handleChange} placeholder="Хямдарсан (₮)" className="w-full bg-gray-50 border-none rounded-xl p-4 font-black text-rose-500 mt-1" />
              </div>
            </div>
          </div>
        </div>

        {/* БАРУУН ТАЛ: КАТЕГОРИ, СОНГОЛТУУД БОЛОН ХАДГАЛАХ */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                Ангилал
              </h2>
              <div className="flex flex-wrap gap-2">
                  {dbCategories.map(cat => {
                      const isSelected = formData.categories.includes(cat.name);
                      return (
                          <button key={cat.id} type="button" onClick={() => toggleCategory(cat.name)} className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${isSelected ? "bg-[#333333] border-[#333333] text-white shadow-md" : "bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100"}`}>
                              {cat.name === "Бэлэг дурсгал" ? <Gift size={12}/> : <Flower2 size={12}/>}
                              {cat.name}
                          </button>
                      );
                  })}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#87A96B] uppercase mb-3 block ml-1">Зориулалт (Occasions)</label>
              <div className="flex flex-wrap gap-2">
                {PURPOSE_OPTIONS.map(purp => (
                  <button 
                    key={purp} type="button" 
                    onClick={() => toggleItem(selectedPurposes, setSelectedPurposes, purp)}
                    className={`px-3 py-2 rounded-xl text-[11px] font-bold transition border ${selectedPurposes.includes(purp) ? "bg-[#87A96B] border-[#87A96B] text-white shadow-sm" : "bg-white border-gray-100 text-gray-400 hover:border-gray-300"}`}
                  >
                    {purp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            {!isGiftProduct && (
              <>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Савалгаа</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {PACKAGING_OPTIONS.map(opt => (
                      <button key={opt} type="button" onClick={() => setFormData({...formData, packaging: opt})} className={`py-3 rounded-xl text-[11px] font-bold transition shadow-sm ${formData.packaging === opt ? "bg-[#333333] text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}>{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Тоо ширхэг (Иш)</h3>
                  <input type="number" name="stemCount" placeholder="Жишээ: 51" value={formData.stemCount} onChange={handleChange} className="w-full bg-gray-50 border-none rounded-xl p-4 text-sm font-black" />
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
                    className={`w-8 h-8 rounded-full border-2 shadow-sm transition-transform active:scale-90 flex items-center justify-center ${selectedColors.includes(color.name) ? "border-[#333333] scale-110" : "border-transparent hover:scale-105"}`}
                    style={{ background: color.hex }}
                    title={color.name}
                  >
                     {selectedColors.includes(color.name) && <Check size={14} className={color.name === 'Цагаан' ? 'text-black' : 'text-white'} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Хэмжээ</h3>
              <div className="flex gap-2">
                {SIZE_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => setFormData({...formData, size: s})} className={`flex-1 py-3 rounded-xl text-[11px] font-bold transition ${formData.size === s ? "bg-[#333333] text-white" : "bg-gray-50 text-gray-400 hover:bg-gray-100"}`}>{s}</button>
                ))}
              </div>
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-[#E2A9BE] text-white font-black py-5 rounded-[24px] shadow-xl shadow-[#E2A9BE]/20 hover:bg-[#d89bb1] transition active:scale-95 disabled:bg-gray-200 uppercase tracking-widest text-xs">
            {saving ? "Хадгалж байна..." : "Өөрчлөлтийг хадгалах"}
          </button>
        </div>

      </form>
    </div>
  );
}