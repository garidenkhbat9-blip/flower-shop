"use client";

import { useState, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebase"; // storage нэмэгдсэн байх шаардлагатай
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function PersonalSection() {
  const [loading, setLoading] = useState(true);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPass, setSavingPass] = useState(false);

  // Мэдээлэл хадгалах State
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    photoURL: "",
  });

  // Нууц үг солих State
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  // Нууц үгний шалгуур үзүүлэлтүүд
  const validations = {
    length: passwords.newPassword.length >= 8,
    upper: /[A-Z]/.test(passwords.newPassword),
    lower: /[a-z]/.test(passwords.newPassword),
    number: /[0-9]/.test(passwords.newPassword),
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            setFormData({
              firstName: data.firstName || "",
              lastName: data.lastName || "",
              email: user.email || "",
              phone: data.phoneNumber || "",
              photoURL: data.photoURL || "",
            });
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchUserData();
  }, []);

  // Хувийн мэдээлэл хадгалах
  const handleInfoSave = async () => {
    setSavingInfo(true);
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        await updateDoc(docRef, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phoneNumber: formData.phone,
        });
        alert("Мэдээлэл амжилттай хадгалагдлаа.");
      }
    } catch (error) {
      alert("Алдаа гарлаа.");
    } finally {
      setSavingInfo(false);
    }
  };

  // Нууц үг солих
  const handlePasswordSave = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("Нууц үгүүд зөрж байна.");
      return;
    }
    setSavingPass(true);
    try {
      const user = auth.currentUser;
      if (user) {
        await updatePassword(user, passwords.newPassword);
        alert("Нууц үг амжилттай солигдлоо.");
        setPasswords({ newPassword: "", confirmPassword: "" });
      }
    } catch (error: any) {
      alert("Алдаа гарлаа. Та дахин нэвтэрч байгаад оролдоно уу.");
    } finally {
      setSavingPass(false);
    }
  };

  // Зураг оруулах
  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const user = auth.currentUser;
    if (!user) return;

    try {
      const storageRef = ref(storage, `avatars/${user.uid}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      await updateDoc(doc(db, "users", user.uid), { photoURL: url });
      setFormData({ ...formData, photoURL: url });
    } catch (error) {
      alert("Зураг оруулахад алдаа гарлаа.");
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto w-8 h-8 text-gray-300" /></div>;

  return (
    <div className="max-w-4xl space-y-12">
      
      {/* SECTION 1: TOKHIRGOO */}
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Тохиргоо</h2>
          <p className="text-sm text-gray-500">Өөрийн хувийн мэдээллийг засах</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Нэр</label>
            <input 
              type="text" 
              value={formData.firstName}
              onChange={(e) => setFormData({...formData, firstName: e.target.value})}
              className="w-full bg-[#FFFDF9] border border-[#f0ece8] p-3 rounded-xl focus:ring-2 focus:ring-[#87A96B] text-[#333333] outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Овог</label>
            <input 
              type="text" 
              value={formData.lastName}
              onChange={(e) => setFormData({...formData, lastName: e.target.value})}
              className="w-full bg-[#FFFDF9] border border-[#f0ece8] p-3 rounded-xl focus:ring-2 focus:ring-[#87A96B] text-[#333333] outline-none" 
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-sm font-bold text-gray-700">Зураг</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-tr from-teal-500 to-orange-400 rounded-full overflow-hidden">
                {formData.photoURL && <img src={formData.photoURL} className="w-full h-full object-cover" />}
              </div>
              <label className="cursor-pointer border border-gray-200 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50">
                Зураг оруулах
                <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">И-мэйл</label>
            <input 
              type="email" 
              disabled 
              value={formData.email}
              className="w-full bg-[#FFFDF9] border border-[#f0ece8] p-3 rounded-xl text-gray-400 cursor-not-allowed outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Утасны дугаар</label>
            <input 
              type="text" 
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full bg-[#FFFDF9] border border-[#f0ece8] p-3 rounded-xl focus:ring-2 focus:ring-[#87A96B] text-[#333333] outline-none" 
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button 
            onClick={handleInfoSave}
            disabled={savingInfo}
            className="bg-[#E2A9BE] text-[#FFFDF9] px-8 py-3 rounded-xl font-bold hover:bg-[#d89bb1] transition disabled:opacity-50"
          >
            {savingInfo ? "Түр хүлээнэ үү..." : "Хадгалах"}
          </button>
        </div>
      </section>

      {/* SECTION 2: PASSWORD CHANGE */}
      <section className="space-y-6 pt-6 border-t border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Нууц үг солих</h2>
          <p className="text-sm text-gray-500">Өөрийн нэвтрэх нууц үгийг солих</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Шинэ нууц үг</label>
            <input 
              type="password" 
              value={passwords.newPassword}
              onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
              className="w-full bg-[#FFFDF9] border border-[#f0ece8] p-3 rounded-xl focus:ring-2 focus:ring-[#87A96B] text-[#333333] outline-none placeholder-gray-400" 
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">Шинэ нууц үг давтах</label>
            <input 
              type="password" 
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
              className="w-full bg-[#FFFDF9] border border-[#f0ece8] p-3 rounded-xl focus:ring-2 focus:ring-[#87A96B] text-[#333333] outline-none placeholder-gray-400" 
              placeholder="Шинэ нууц үг давтах"
            />
          </div>
        </div>

        {/* Validation Checklist */}
        <div className="space-y-2">
          <ValidationItem label="8-аас дээш тэмдэгттэй" isValid={validations.length} />
          <ValidationItem label="Том үсэг орсон байх" isValid={validations.upper} />
          <ValidationItem label="Жижиг үсэг орсон байх" isValid={validations.lower} />
          <ValidationItem label="Тоо орсон байх" isValid={validations.number} />
        </div>

        <div className="flex justify-end">
          <button 
            onClick={handlePasswordSave}
            disabled={savingPass || !Object.values(validations).every(v => v)}
            className="bg-[#E2A9BE] text-[#FFFDF9] px-8 py-3 rounded-xl font-bold hover:bg-[#d89bb1] transition disabled:opacity-50"
          >
            {savingPass ? "Түр хүлээнэ үү..." : "Хадгалах"}
          </button>
        </div>
      </section>
    </div>
  );
}

// Туслах компонент: Нууц үг шалгах мөр
function ValidationItem({ label, isValid }: { label: string; isValid: boolean }) {
  return (
    <div className={`flex items-center gap-2 text-xs font-medium ${isValid ? "text-green-500" : "text-red-400"}`}>
      {isValid ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      {label}
    </div>
  );
}