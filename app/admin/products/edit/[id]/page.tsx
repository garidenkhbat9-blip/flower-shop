"use client";

import { useEffect, useState, use } from "react"; 
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { Check, Tag, Flower2, Gift, ChevronLeft, X, ImagePlus } from "lucide-react";

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
    <div className="max-w-6xl mx-auto p-8 font-montserrat text-[#1A1A1A]">
      
      {showSuccess && (
        <div className="fixed bottom-12 right-12 bg-[#1A1A1A] text-white border border-black shadow-2xl px-8 py-5 rounded-[2px] flex items-center gap-4 z-50 animate-in slide-in-from-bottom-4">
          <Check size={18} strokeWidth={1.5} />
          <span className="text-[10px] font-medium uppercase tracking-[0.2em]">Амжилттай хадгалагдлаа!</span>
        </div>
      )}

      <div className="flex items-center justify-between mb-12">
        <button onClick={() => router.back()} className="p-4 hover:bg-[#1A1A1A] hover:text-white rounded-[2px] transition-all border border-black/[0.05] bg-white shadow-sm"><ChevronLeft size={20} strokeWidth={1.5} /></button>
        <h1 className="text-2xl lg:text-4xl font-playfair font-medium text-[#1A1A1A]">Edit Product</h1>
        <div className="w-12" />
      </div>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* ЗҮҮН ТАЛ: ЗУРАГ БОЛОН ҮНДСЭН МЭДЭЭЛЭЛ */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 rounded-[2px] border border-black/[0.03] shadow-sm">
            <h2 className="text-[10px] font-medium text-[#1A1A1A]/30 uppercase tracking-[0.3em] mb-8">Зураг</h2>
            
            {/* Uploaded Images Grid */}
            {(formData.imageUrls.length > 0 || newImageFiles.length > 0) && (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-8">
                {/* Existing Images */}
                {formData.imageUrls.map((url, index) => (
                   <div key={`exist-${index}`} className="relative group aspect-[4/5] rounded-[2px] overflow-hidden border border-black/[0.03] shadow-sm">
                    <img src={url} className="w-full h-full object-cover" alt="" />
                    {index === 0 && (
                      <span className="absolute top-2 left-2 bg-[#1A1A1A]/80 text-white text-[7px] font-medium px-2 py-1 rounded-sm uppercase tracking-widest">Main</span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                    <button 
                      type="button" 
                      onClick={() => removeExistingImage(index)} 
                      className="absolute top-2 right-2 bg-white text-[#1A1A1A] rounded-full p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-[#1A1A1A] hover:text-white"
                    >
                      <X size={12} strokeWidth={2}/>
                    </button>
                  </div>
                ))}
                
                {/* New Images */}
                {newImageFiles.map((file, index) => (
                  <div key={`new-${index}`} className="relative group aspect-[4/5] rounded-[2px] overflow-hidden border border-black/[0.03] shadow-sm">
                    <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="" />
                    {formData.imageUrls.length === 0 && index === 0 && (
                       <span className="absolute top-2 left-2 bg-[#1A1A1A]/80 text-white text-[7px] font-medium px-2 py-1 rounded-sm uppercase tracking-widest">Main</span>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                    <button 
                      type="button" 
                      onClick={() => removeNewImage(index)} 
                      className="absolute top-2 right-2 bg-white text-[#1A1A1A] rounded-full p-2 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-[#1A1A1A] hover:text-white"
                    >
                      <X size={12} strokeWidth={2}/>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Drop Zone */}
            <div 
              onClick={() => document.getElementById('edit-image-upload')?.click()}
              onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-[#1A1A1A]', 'bg-[#FCFBF9]'); }}
              onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-[#1A1A1A]', 'bg-[#FCFBF9]'); }}
              onDrop={(e) => { 
                e.preventDefault(); 
                e.currentTarget.classList.remove('border-[#1A1A1A]', 'bg-[#FCFBF9]');
                if (e.dataTransfer.files) {
                  const filesArray = Array.from(e.dataTransfer.files);
                  setNewImageFiles(prev => [...prev, ...filesArray]);
                }
              }}
              className={`relative cursor-pointer border border-dashed rounded-[2px] transition-all hover:border-[#1A1A1A] hover:bg-[#FCFBF9] ${
                (formData.imageUrls.length === 0 && newImageFiles.length === 0) 
                  ? 'border-black/[0.05] py-20' 
                  : 'border-black/[0.05] py-10'
              }`}
            >
              <div className="flex flex-col items-center justify-center gap-4 text-center px-6">
                <div className={`rounded-full flex items-center justify-center transition-all ${
                  (formData.imageUrls.length === 0 && newImageFiles.length === 0) 
                    ? 'w-20 h-20 bg-[#F3F2F0] text-[#1A1A1A]' 
                    : 'w-12 h-12 bg-[#F3F2F0] text-[#1A1A1A]'
                }`}>
                   <ImagePlus size={newImageFiles.length === 0 ? 32 : 20} strokeWidth={1.5} />
                </div>
                {(formData.imageUrls.length === 0 && newImageFiles.length === 0) ? (
                  <>
                    <div>
                      <p className="text-[11px] font-medium text-[#1A1A1A] uppercase tracking-[0.1em]">Зураг чирж оруулах эсвэл дарна уу</p>
                      <p className="text-[9px] text-[#1A1A1A]/30 mt-2 uppercase tracking-widest font-light">PNG, JPG, WEBP — Multiple files supported</p>
                    </div>
                    <span className="inline-flex items-center gap-2 bg-[#1A1A1A] text-white text-[9px] font-medium uppercase tracking-[0.2em] px-8 py-4 rounded-[2px] hover:bg-black transition shadow-xl mt-4">
                      <ImagePlus size={14} strokeWidth={1.5} /> Зураг сонгох
                    </span>
                  </>
                ) : (
                  <p className="text-[9px] text-[#1A1A1A]/40 font-medium uppercase tracking-widest">
                    + Нэмэлт зураг оруулах <span className="text-[#1A1A1A]/20">({formData.imageUrls.length + newImageFiles.length} зургууд)</span>
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

          <div className="bg-white p-8 rounded-[2px] border border-black/[0.03] shadow-sm space-y-8">
            <h2 className="text-[10px] font-medium text-[#1A1A1A]/30 uppercase tracking-[0.3em]">Мэдээлэл</h2>
            <div className="space-y-8">
              <div>
                <label className="text-[9px] font-medium text-[#1A1A1A]/30 uppercase tracking-[0.2em] mb-4 block">Бүтээгдэхүүний гарчиг (Нэр)</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Жишээ: 101 Сарнайтай сагс" className="w-full bg-[#FCFBF9] border border-black/[0.03] rounded-[2px] p-5 font-playfair text-lg outline-none focus:border-[#1A1A1A] transition-all" />
              </div>
              
              {!isGiftProduct && (
                <div>
                  <label className="text-[9px] font-medium text-[#1A1A1A]/30 uppercase tracking-[0.2em] mb-4 block">Цэцэгний төрөл</label>
                  <input 
                    list="flower-names" type="text" name="flowerType"
                    placeholder="Сарнай, Алтанзул гэх мэт..." 
                    value={formData.flowerType} 
                    onChange={handleChange} 
                    className="w-full bg-[#FCFBF9] border border-black/[0.03] rounded-[2px] p-5 text-[11px] uppercase tracking-wider outline-none focus:border-[#1A1A1A] transition-all" 
                  />
                  <datalist id="flower-names">
                    {FLOWER_NAME_SUGGESTIONS.map(name => <option key={name} value={name} />)}
                  </datalist>
                </div>
              )}

              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="text-[9px] font-medium text-[#1A1A1A]/30 uppercase tracking-[0.2em] mb-4 block">Үнэ (₮)</label>
                  <input required type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Үнэ (₮)" className="w-full bg-[#FCFBF9] border border-black/[0.03] rounded-[2px] p-5 font-playfair text-xl outline-none focus:border-[#1A1A1A] transition-all" />
                </div>
                <div>
                  <label className="text-[9px] font-medium text-[#1A1A1A]/30 uppercase tracking-[0.2em] mb-4 block">Хямдарсан (₮)</label>
                  <input type="number" name="discountedPrice" value={formData.discountedPrice} onChange={handleChange} placeholder="Хямдарсан (₮)" className="w-full bg-[#FCFBF9] border border-black/[0.03] rounded-[2px] p-5 font-playfair text-xl text-rose-600 outline-none focus:border-[#1A1A1A] transition-all" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* БАРУУН ТАЛ: КАТЕГОРИ, СОНГОЛТУУД БОЛОН ХАДГАЛАХ */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[2px] border border-black/[0.03] shadow-sm space-y-10">
            <div>
              <h2 className="text-[10px] font-medium text-[#1A1A1A]/30 uppercase tracking-[0.3em] mb-6">Ангилал</h2>
              <div className="flex flex-wrap gap-3">
                  {dbCategories.map(cat => {
                      const isSelected = formData.categories.includes(cat.name);
                      return (
                          <button key={cat.id} type="button" onClick={() => toggleCategory(cat.name)} className={`px-4 py-3 rounded-[2px] text-[10px] font-medium uppercase tracking-wider transition-all border ${isSelected ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-xl" : "bg-white text-[#1A1A1A]/40 border-black/[0.05] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"}`}>
                              {cat.name}
                          </button>
                      );
                  })}
              </div>
            </div>

            <div>
              <label className="text-[9px] font-medium text-[#1A1A1A]/30 uppercase tracking-[0.2em] mb-6 block">Зориулалт (Occasions)</label>
              <div className="flex flex-wrap gap-3">
                {PURPOSE_OPTIONS.map(purp => (
                  <button 
                    key={purp} type="button" 
                    onClick={() => toggleItem(selectedPurposes, setSelectedPurposes, purp)}
                    className={`px-4 py-3 rounded-[2px] text-[10px] font-medium uppercase tracking-wider transition-all border ${selectedPurposes.includes(purp) ? "bg-[#1A1A1A] border-[#1A1A1A] text-white shadow-xl" : "bg-white text-[#1A1A1A]/40 border-black/[0.05] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"}`}
                  >
                    {purp}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2px] border border-black/[0.03] shadow-sm space-y-10">
            {!isGiftProduct && (
              <>
                <div>
                  <h3 className="text-[9px] font-medium text-[#1A1A1A]/30 uppercase tracking-[0.2em] mb-6">Савалгаа</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {PACKAGING_OPTIONS.map(opt => (
                      <button key={opt} type="button" onClick={() => setFormData({...formData, packaging: opt})} className={`py-4 rounded-[2px] text-[10px] font-medium uppercase tracking-wider transition-all border ${formData.packaging === opt ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xl" : "bg-white text-[#1A1A1A]/40 border-black/[0.05] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"}`}>{opt}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[9px] font-medium text-[#1A1A1A]/30 uppercase tracking-[0.2em] mb-6">Тоо ширхэг (Иш)</h3>
                  <input type="number" name="stemCount" placeholder="Жишээ: 51" value={formData.stemCount} onChange={handleChange} className="w-full bg-[#FCFBF9] border border-black/[0.03] rounded-[2px] p-5 text-sm font-playfair font-medium outline-none focus:border-[#1A1A1A]" />
                </div>
              </>
            )}

            <div>
              <h3 className="text-[9px] font-medium text-[#1A1A1A]/30 uppercase tracking-[0.2em] mb-6">Өнгө сонгох</h3>
              <div className="flex flex-wrap gap-4 p-4 bg-[#FCFBF9] rounded-[2px] border border-black/[0.03]">
                {COLOR_OPTIONS.map(color => (
                  <button 
                    key={color.name} type="button" 
                    onClick={() => toggleItem(selectedColors, setSelectedColors, color.name)}
                    className={`w-10 h-10 rounded-full border-2 transition-all active:scale-90 flex items-center justify-center ${selectedColors.includes(color.name) ? "border-[#1A1A1A] scale-110 shadow-lg" : "border-transparent hover:scale-105"}`}
                    style={{ background: color.hex }}
                    title={color.name}
                  >
                     {selectedColors.includes(color.name) && <Check size={16} className={color.name === 'Цагаан' ? 'text-black' : 'text-white'} strokeWidth={2.5} />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-[9px] font-medium text-[#1A1A1A]/30 uppercase tracking-[0.2em] mb-6">Хэмжээ</h3>
              <div className="flex gap-3">
                {SIZE_OPTIONS.map(s => (
                  <button key={s} type="button" onClick={() => setFormData({...formData, size: s})} className={`flex-1 py-4 rounded-[2px] text-[10px] font-medium uppercase tracking-wider transition-all border ${formData.size === s ? "bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-xl" : "bg-white text-[#1A1A1A]/40 border-black/[0.05] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"}`}>{s}</button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving} className="w-full bg-[#1A1A1A] text-white font-medium py-6 rounded-[2px] hover:bg-black transition-all active:scale-95 disabled:bg-gray-200 shadow-2xl shadow-black/10 uppercase tracking-[0.3em] text-[11px]">
              {saving ? "Хадгалж байна..." : "Өөрчлөлтийг хадгалах"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}