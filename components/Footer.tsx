import { Truck, CreditCard, ShieldCheck, Facebook, Instagram } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Image нэмэгдсэн

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-auto font-sans pb-20 md:pb-0 print:hidden">

      {/* 1. БАТАЛГААЖУУЛАЛТЫН ХЭСЭГ */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-16 border-b border-black/[0.03]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="flex gap-5 items-start">
            <div className="w-12 h-12 bg-[#FCFBF9] rounded-2xl flex items-center justify-center text-[#1A1A1A] shrink-0 border border-black/[0.03] shadow-sm">
              <Truck size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-bold text-[10px] mb-2 uppercase tracking-[0.3em] text-[#1A1A1A]">Хүргэлтийн нөхцөл</h4>
              <p className="text-[11px] text-[#1A1A1A]/50 leading-relaxed font-medium">
                Бэлэн бүтээгдэхүүн захиалга баталгаажсанаас 24 цагийн дотор хүргэгдэнэ.
              </p>
            </div>
          </div>
          <div className="flex gap-5 items-start md:border-l md:pl-12 border-black/[0.03]">
            <div className="w-12 h-12 bg-[#FCFBF9] rounded-2xl flex items-center justify-center text-[#1A1A1A] shrink-0 border border-black/[0.03] shadow-sm">
              <CreditCard size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-bold text-[10px] mb-2 uppercase tracking-[0.3em] text-[#1A1A1A]">Төлбөрийн мэдээлэл</h4>
              <p className="text-[11px] text-[#1A1A1A]/50 leading-relaxed font-medium">
                Та захиалгын болон хүргэлтийн төлбөрөө 100% төлснөөр таны захиалга баталгаажна.
              </p>
            </div>
          </div>
          <div className="flex gap-5 items-start md:border-l md:pl-12 border-black/[0.03]">
            <div className="w-12 h-12 bg-[#FCFBF9] rounded-2xl flex items-center justify-center text-[#1A1A1A] shrink-0 border border-black/[0.03] shadow-sm">
              <ShieldCheck size={22} strokeWidth={1.5} />
            </div>
            <div>
              <h4 className="font-bold text-[10px] mb-2 uppercase tracking-[0.3em] text-[#1A1A1A]">Үйлчилгээний нөхцөл</h4>
              <p className="text-[11px] text-[#1A1A1A]/50 leading-relaxed font-medium">
                Захиалгын дагуу бэлддэг учраас сонголтоо зөв хийгээрэй. Баталгаажсанаас 1 цагийн дараа цуцлах боломжгүй.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ҮНДСЭН МЭДЭЭЛЛИЙН ХЭСЭГ */}
      <div className="max-w-7xl mx-auto px-8 sm:px-12 py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
          {/* ФҮТЕР ЛОГО */}
          <div className="col-span-1 md:col-span-4">
            <Image
              src="/logo1.png"
              alt="Footer Logo"
              width={250}
              height={80}
              className="h-20 md:h-24 w-auto object-contain mb-8"
            />
            <p className="text-[11px] text-[#1A1A1A]/40 leading-loose max-w-xs font-medium uppercase tracking-wider">
              “Цэцэг өгөх нь авахаасаа илүү жаргалтай ”
            </p>
            <p className="mt-6 text-[11px] text-[#1A1A1A]/30 leading-relaxed max-w-xs font-medium">
              Grow Room нь Улаанбаатар Галлериад байрлах орчин үеийн цэцгийн дэлгүүр бөгөөд онцгой мөч бүрт зориулсан шинэхэн цэцгийн баглаа, бэлгийн шийдэл, захиалгат үйлчилгээ үзүүлдэг.
            </p>
          </div>

          <div className="col-span-1 md:col-span-2">
            <h4 className="font-bold text-[10px] mb-8 uppercase tracking-[0.3em] text-[#1A1A1A]">Туслах цэс</h4>
            <ul className="space-y-4">
              <li><Link href="/products" className="text-[11px] font-bold text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors uppercase tracking-widest">Цуглуулга</Link></li>
              <li><Link href="/about" className="text-[11px] font-bold text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors uppercase tracking-widest">Бидний тухай</Link></li>
              <li><Link href="/sale" className="text-[11px] font-bold text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors uppercase tracking-widest">Хямдрал</Link></li>
              <li><Link href="/profile" className="text-[11px] font-bold text-[#1A1A1A]/40 hover:text-[#1A1A1A] transition-colors uppercase tracking-widest">Миний бүртгэл</Link></li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3">
            <h4 className="font-bold text-[10px] mb-8 uppercase tracking-[0.3em] text-[#1A1A1A]">Холбоо барих</h4>
            <ul className="space-y-4">
              <li className="text-[11px] font-bold text-[#1A1A1A]/40 uppercase tracking-widest leading-relaxed">Ulaanbaatar Galleria, 2-р давхар, Ulaanbaatar</li>
              <li className="text-[11px] font-bold text-[#1A1A1A]/40 uppercase tracking-widest">9993 2671, 9993 3526</li>
              <li className="text-[11px] font-bold text-[#1A1A1A]/40 uppercase tracking-widest">growroom.flower@gmail.com</li>
            </ul>
          </div>

          <div className="col-span-1 md:col-span-3 flex md:justify-end items-start gap-6">
            <Link href="https://www.facebook.com/profile.php?id=61559804052197" className="text-[#1A1A1A]/30 hover:text-[#1A1A1A] transition-colors"><Facebook size={20} strokeWidth={1.5} /></Link>
            <Link href="https://www.instagram.com/grow_room" className="text-[#1A1A1A]/30 hover:text-[#1A1A1A] transition-colors"><Instagram size={20} strokeWidth={1.5} /></Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-100">
        <p className="text-xs text-center md:text-left text-gray-400 font-montserrat">
          {new Date().getFullYear()} © Grow Room Florist. Бүх эрх хамгаалагдсан.
        </p>
      </div>
    </footer>
  );
}