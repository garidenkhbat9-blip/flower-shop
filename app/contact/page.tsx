"use client";

import { useState } from "react";
import {
  Phone,
  Mail,
  MapPin,
  Send,
  Facebook,
  Instagram,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });



  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans">
      {/* HEADER */}
      <div className="bg-white border-b border-gray-100 px-6 py-12 md:py-20 text-center">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center gap-2 text-xs text-gray-400 mb-4">
            <Link href="/" className="hover:text-black transition">
              Нүүр
            </Link>
            <ChevronRight size={12} />
            <span className="text-black">Холбоо барих</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter mb-6">
            Холбоо барих
          </h1>

          <p className="text-gray-400 max-w-xl mx-auto text-sm md:text-base">
            Танд ямар нэгэн асуулт, санал хүсэлт байна уу? Бид танд туслахад үргэлж бэлэн байна.
          </p>
        </div>
      </div>

      {/* CONTACT CARDS */}
      <div className="max-w-7xl mx-auto px-6 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <ContactCard
            icon={<Phone size={24} />}
            title="Утас"
            value="8097 9624, 7733-7733"
            sub="Өдөр бүр 09:00 - 21:00"
          />

          <ContactCard
            icon={<Mail size={24} />}
            title="И-мэйл"
            value="unurflowers@gmail.com"
            sub="24 цагийн дотор хариулна"
          />

          <ContactCard
            icon={<MapPin size={24} />}
            title="Хаяг"
            value="Бага тойрог, Сүхбаатар дүүрэг"
            sub="Улаанбаатар хот"
          />
        </div>

        {/* FORM + SOCIAL */}
        

          {/* SOCIAL */}
         
        </div>
      </div>
  );
}

/* COMPONENTS */

function ContactCard({ icon, title, value, sub }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm">
      <div className="mb-4 text-[#8BB711]">{icon}</div>
      <p className="text-xs text-gray-400 uppercase font-bold">{title}</p>
      <p className="font-black text-lg">{value}</p>
      <p className="text-sm text-gray-400">{sub}</p>
    </div>
  );
}

function InputField({ label, ...props }: any) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase text-gray-400 ml-2">
        {label}
      </label>
      <input
        required
        className="w-full bg-gray-50 rounded-2xl p-5 outline-none"
        {...props}
      />
    </div>
  );
}

function SocialBtn({ icon, link }: any) {
  return (
    <Link
      href={link}
      className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-black hover:text-white transition"
    >
      {icon}
    </Link>
  );
}