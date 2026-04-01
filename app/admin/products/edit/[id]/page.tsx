"use client";

import { useEffect, useState, use } from "react"; 
import { db, storage } from "@/lib/firebase";
import { doc, getDoc, updateDoc, serverTimestamp, collection, getDocs, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import { Check, Tag } from "lucide-react"; // Icon нэмэв

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
    // description: "",  <-- ХАСАГДЛАА
    categories: [] as string[], // Олон категори сонгох боломжтой болгов
    inStock: true,
    imageUrls: [] as string[], 
  });

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
          });
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
        categories: formData.categories, // Array хэлбэрээр хадгална
        imageUrls: finalImageUrls, 
        inStock: formData.inStock,
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
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Зургийн сан</h2>
            <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                {formData.imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                        <img src={url} className="w-20 h-24 object-cover rounded-xl border" />
                        <button type="button" onClick={() => removeExistingImage(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px]">✕</button>
                    </div>
                ))}
                <label className="w-20 h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center cursor-pointer hover:bg-white transition">
                    <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="hidden" />
                    <span className="text-gray-300 text-2xl">+</span>
                </label>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Мэдээлэл</h2>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Цэцгийн нэр" className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold" />
            
            <div className="grid grid-cols-2 gap-4">
              <input required type="number" name="price" value={formData.price} onChange={handleChange} placeholder="Үнэ (₮)" className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold" />
              <input type="number" name="discountedPrice" value={formData.discountedPrice} onChange={handleChange} placeholder="Хямдарсан (₮)" className="w-full bg-gray-50 border-none rounded-xl p-4 font-bold text-rose-500" />
            </div>
          </div>
        </div>

        {/* БАРУУН ТАЛ: КАТЕГОРИ БОЛОН ХАДГАЛАХ */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Ангилал</h2>
            <div className="flex flex-wrap gap-2">
                {dbCategories.map(cat => {
                    const isSelected = formData.categories.includes(cat.name);
                    return (
                        <button key={cat.id} type="button" onClick={() => toggleCategory(cat.name)} className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isSelected ? "bg-black border-black text-white shadow-lg" : "bg-gray-50 text-gray-400 border-transparent"}`}>
                            {cat.name}
                        </button>
                    );
                })}
            </div>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-green-600 text-white font-black py-5 rounded-[24px] shadow-xl shadow-green-100 hover:bg-green-700 transition active:scale-95 disabled:bg-gray-200 uppercase tracking-widest text-xs">
            {saving ? "Хадгалж байна..." : "Өөрчлөлтийг хадгалах"}
          </button>
        </div>

      </form>
    </div>
  );
}