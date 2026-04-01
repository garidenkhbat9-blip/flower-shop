import { Package } from "lucide-react";
import Link from "next/link";

export default function OrdersSection() {
  return (
    <div className="flex flex-col items-center justify-center h-[400px] space-y-6 animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center">
        <Package className="w-10 h-10 text-gray-200" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-800">Захиалга байхгүй байна</h3>
        <p className="text-sm text-gray-400 mt-1">Та одоогоор ямар нэгэн захиалга хийгээгүй байна.</p>
      </div>
      <Link href="/" className="bg-green-400 text-white font-bold px-8 py-3 rounded-2xl hover:bg-green-500 transition shadow-lg shadow-green-100">
        Дэлгүүр хэсэх
      </Link>
    </div>
  );
}