import { Truck, CreditCard, ShieldCheck, Facebook, Instagram } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Image нэмэгдсэн

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-200 mt-auto font-sans pb-20 md:pb-0">
      
      {/* 1. БАТАЛГААЖУУЛАЛТЫН ХЭСЭГ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex gap-4 items-start">
            <Truck className="w-8 h-8 text-gray-700 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm mb-1 uppercase">Хүргэлтийн нөхцөл</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Бэлэн бүтээгдэхүүн захиалга баталгаажсанаас 24-48 цагийн дотор хүргэгдэнэ.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start md:border-l md:pl-8 border-gray-200">
            <CreditCard className="w-8 h-8 text-gray-700 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm mb-1 uppercase">Төлбөрийн мэдээлэл</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Та захиалгын болон хүргэлтийн төлбөрөө 100% төлснөөр таны захиалга баталгаажна.
              </p>
            </div>
          </div>
          <div className="flex gap-4 items-start md:border-l md:pl-8 border-gray-200">
            <ShieldCheck className="w-8 h-8 text-gray-700 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-sm mb-1 uppercase">Үйлчилгээний нөхцөл</h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Захиалгын дагуу бэлддэг учраас сонголтоо зөв хийгээрэй. Баталгаажсанаас 1 цагийн дараа цуцлах боломжгүй.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ҮНДСЭН МЭДЭЭЛЛИЙН ХЭСЭГ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* ФҮТЕР ЛОГО */}
          {/* Footer доторх лого хэсэг */}
<div className="col-span-1 flex items-start">
  <Image 
    src="/logo.png" 
    alt="Footer Logo" 
    width={250} 
    height={80} 
    className="h-20 md:h-28 w-auto object-contain" // Өндрийг нь ихэсгэв
  />
</div>
          
          <div className="col-span-1">
            <h4 className="font-semibold text-sm mb-4">Туслах цэс</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li><Link href="/about" className="hover:text-black">Бидний тухай</Link></li>
              <li><Link href="/contact" className="hover:text-black">Холбоо барих</Link></li>
              <li><Link href="/faq" className="hover:text-black">Түгээмэл асуултууд</Link></li>
            </ul>
          </div>
          <div className="col-span-1">
            <h4 className="font-semibold text-sm mb-4">Холбоо барих</h4>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>Хаяг: Сүхбаатар дүүрэг, 1-р хороо</li>
              <li>Утас: 8097 9624</li>
              <li>И-мэйл: unurflowers@gmail.com</li>
            </ul>
          </div>
          <div className="col-span-1 flex md:justify-end gap-4">
            <Link href="https://www.facebook.com/Unurflowers" className="text-gray-500 hover:text-black"><Facebook className="w-5 h-5" /></Link>
            <Link href="https://www.instagram.com/unurflowers_" className="text-gray-500 hover:text-black"><Instagram className="w-5 h-5" /></Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-gray-100">
        <p className="text-xs text-center md:text-left text-gray-400">
          2024 © Онлайн худалдааг хөгжүүлэгч Unur Flowers. Бүх эрх хамгаалагдсан.
        </p>
      </div>
    </footer>
  );
}