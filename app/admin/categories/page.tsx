"use client";
import { useState, useEffect, useRef } from "react";
import { db, storage } from "@/lib/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, onSnapshot, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { compressImage } from "@/lib/imageUtils";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAdminDialog } from "@/context/AdminDialogContext";
import { ImagePlus, Trash2, X, Edit2, Check, RotateCcw } from "lucide-react";

export default function CategoriesPage() {
  const { alert, confirm } = useAdminDialog();
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null); // Засварлаж буй ID
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const q = query(collection(db, "categories"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Хурд сайжруулахын тулд шууд preview үүсгэнэ
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setNewCategory("");
    setImageFile(null);
    setImagePreview(null);
    setEditId(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Засварлах горимд шилжих
  const handleEditClick = (cat: any) => {
    setEditId(cat.id);
    setNewCategory(cat.name);
    setImagePreview(cat.imageUrl); // Хуучин зургийг харуулна
    setImageFile(null); // Шинэ зураг хараахан сонгоогүй
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      await alert("Нэр оруулна уу");
      return;
    }
    
    setLoading(true);
    try {
      let finalImageUrl = imagePreview;

      // 1. Хэрэв шинэ зураг сонгосон бол Upload хийнэ
      if (imageFile) {
        const compressedFile = await compressImage(imageFile);
        const storageRef = ref(storage, `categories/${Date.now()}_${compressedFile.name}`);
        await uploadBytes(storageRef, compressedFile);
        finalImageUrl = await getDownloadURL(storageRef);
      }

      if (editId) {
        // 2. UPDATE (Засварлах)
        await updateDoc(doc(db, "categories", editId), {
          name: newCategory.trim(),
          imageUrl: finalImageUrl,
          updatedAt: serverTimestamp(),
        });
      } else {
        // 3. CREATE (Шинээр нэмэх) - зургийг заавал шаардахгүй
        await addDoc(collection(db, "categories"), {
          name: newCategory.trim(),
          imageUrl: finalImageUrl || null,
          createdAt: serverTimestamp(),
        });
      }

      resetForm();
    } catch (error) {
      console.error(error);
      await alert("Алдаа гарлаа");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (await confirm("Устгахдаа итгэлтэй байна уу?")) {
      await deleteDoc(doc(db, "categories", id));
    }
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto pb-24 text-black">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-black hover:text-gray-800 text-2xl font-bold">←</button>
          <h1 className="text-xl font-bold text-black">{editId ? "Категори засах" : "Категори нэмэх"}</h1>
        </div>
        {editId && (
          <button onClick={resetForm} className="text-sm text-orange-600 flex items-center gap-1 font-bold">
            <RotateCcw size={14} /> Цуцлах
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-md border border-gray-200 space-y-4 mb-8">
        {/* Зураг сонгох хэсэг */}
        <div 
          onClick={() => !loading && fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 relative min-h-[160px] cursor-pointer hover:bg-gray-50 transition"
        >
          {imagePreview ? (
            <div className="relative w-full h-40">
              <Image 
                src={imagePreview} 
                alt="Preview" 
                fill
                unoptimized
                className="w-full h-full object-contain rounded-lg" 
              />
              {!loading && (
                <div className="absolute inset-0 bg-black/10 flex items-center justify-center opacity-0 hover:opacity-100 transition rounded-lg text-white font-bold">
                  Солих
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <ImagePlus size={40} className="text-black mb-2" />
              <span className="text-sm text-black font-semibold">Зураг сонгох</span>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            onChange={handleImageChange} 
            className="hidden" 
          />
        </div>

        <div className="flex gap-2">
          <input 
            type="text" 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)}
            placeholder="Категорийн нэр..."
            className="flex-1 border p-3 rounded-xl outline-none focus:ring-2 focus:ring-green-500 font-semibold text-black placeholder:text-gray-500"
          />
          <button 
            type="submit"
            disabled={loading}
            className={`${editId ? 'bg-orange-500 hover:bg-orange-600' : 'bg-green-600 hover:bg-green-700'} text-white px-8 py-3 rounded-xl disabled:bg-gray-300 font-bold transition flex items-center gap-2 cursor-pointer`}
          >
            {loading ? "Түр хүлээнэ үү..." : editId ? <><Check size={18}/> Хадгалах</> : "Нэмэх"}
          </button>
        </div>
      </form>

      {/* Жагсаалт */}
      <div className="grid gap-3">
        <h2 className="text-xs font-bold text-black uppercase tracking-widest mb-2">Нийт {categories.length} категори</h2>
        {categories.map((cat) => (
          <div key={cat.id} className="flex justify-between items-center bg-white p-3 rounded-xl shadow-sm border border-gray-100 group">
            <div className="flex items-center gap-4">
              {cat.imageUrl ? (
                <div className="relative w-12 h-12 overflow-hidden rounded-lg border border-gray-200">
                  <Image 
                    src={cat.imageUrl} 
                    alt={cat.name} 
                    fill
                    sizes="48px"
                    className="object-cover" 
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 text-xl">🌸</div>
              )}
              <span className="font-bold text-black">{cat.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => handleEditClick(cat)}
                className="text-black hover:text-blue-600 p-2 transition-colors"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => handleDelete(cat.id)} 
                className="text-black hover:text-red-600 transition-colors p-2"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}