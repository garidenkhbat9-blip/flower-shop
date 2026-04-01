"use client";

import { Flower2, Truck, Star, ShieldCheck, Heart, MapPin, Phone, Instagram, Facebook } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans">
      
      {/* 1. HERO SECTION */}
      <section className="relative h-[400px] md:h-[500px] w-full overflow-hidden flex items-center justify-center text-center px-6">
        <div className="absolute inset-0 bg-black/30 z-10" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519304812571-01552210493a?q=80&w=2000')] bg-cover bg-center" />
        
        <div className="relative z-20 max-w-3xl">
          <span className="bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 inline-block border border-white/30">
            Since 2018
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 uppercase italic tracking-tighter leading-none">
            Бидний тухай <br /> <span className="text-rose-300">Unur Flowers</span>
          </h1>
          <p className="text-white/80 text-sm md:text-lg font-medium leading-relaxed">
            Цэцэг бол зөвхөн бэлэг биш, энэ бол таны сэтгэл хөдлөл, хайр халамжийн илэрхийлэл юм.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-20">
        
        {/* 2. MISSION & VISION */}
        {/* 2. MISSION & VISION */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center mb-32">
  
  {/* ЗҮҮН ТАЛ: Зураг (lg:col-span-5 болгож арай нарийсгав) */}
  <div className="lg:col-span-5 relative">
     <div className="relative w-full max-w-[450px] mx-auto lg:mx-0">
        <div className="aspect-square rounded-[50px] overflow-hidden shadow-2xl border-8 border-white">
           <img 
             src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1000" 
             className="w-full h-full object-cover" 
             alt="Our bouquets"
           />
        </div>
        
        {/* Float badge - Байрлалыг нь засав */}
        <div className="absolute -bottom-6 -right-6 md:right-0 bg-white p-5 md:p-7 rounded-[30px] shadow-2xl border border-gray-50 hidden md:block animate-bounce-slow">
           <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0">
                 <Heart size={20} fill="currentColor"/>
              </div>
              <div className="pr-4">
                 <p className="text-xl font-black text-gray-900 leading-none">10k+</p>
                 <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Аз жаргалтай <br/> захиалагч</p>
              </div>
           </div>
        </div>
     </div>
  </div>

  {/* БАРУУН ТАЛ: Текст (lg:col-span-7 болгож ихэсгэв) */}
  <div className="lg:col-span-7 space-y-8">
     <div className="space-y-4">
        <span className="text-[#8BB711] font-black text-[11px] uppercase tracking-[0.3em]">Манай түүх</span>
        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic text-gray-900 leading-tight">
          Цэцэг бүрт <br /> <span className="text-rose-400 text-2xl md:text-4xl">Сэтгэлээ шингээдэг</span>
        </h2>
        <div className="h-1.5 w-20 bg-[#8BB711] rounded-full" />
     </div>
     
     <div className="space-y-6 text-gray-500 leading-relaxed text-base md:text-lg font-medium">
        <p>
           Unur Flowers нь 2018 оноос эхлэн Улаанбаатар хотод үйл ажиллагаагаа явуулж эхэлсэн бөгөөд өдгөө цэцэг хүргэлтийн салбарт тэргүүлэгч дэлгүүрүүдийн нэг болон өргөжжээ. 
        </p>
        <p>
           Бидний гол зорилго бол хамгийн шинэхэн, чанартай цэцэгсээр дамжуулан таны нандин бүхнийг илүү утга учиртай, аз жаргалтай болгоход оршино.
        </p>
     </div>

  
  </div>
</div>

        {/* 3. CORE VALUES */}
        <section className="mb-20 md:mb-32">
   {/* Гарчиг хэсэг - Зайг нь утсан дээр багасгав */}
   <div className="text-center mb-10 md:mb-16 px-6">
      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic mb-2 md:mb-4 text-gray-900">Яагаад биднийг сонгох вэ?</h2>
      <p className="text-gray-400 text-xs md:text-sm font-medium">Бид үйлчилгээ бүртээ сэтгэлээ шингээдэг</p>
   </div>
   
   {/* Картууд - Утсан дээр хөндлөн гүйдэг, Компьютерт 3 багана */}
   <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 px-6 md:px-0 md:grid md:grid-cols-3 md:gap-8">
      <ValueCard 
        icon={<Star size={28}/>} 
        title="Мэргэжлийн ур чадвар" 
        desc="Манай цэцэгчид загвар бүрийг урлагийн бүтээл болгож бэлддэг." 
        color="text-yellow-600"
        bgColor="bg-yellow-50"
      />
      <ValueCard 
        icon={<ShieldCheck size={28}/>} 
        title="Найдвартай байдал" 
        desc="Таны захиалга яг цагтаа, зурагтайгаа ижилхэн очих болно." 
        color="text-blue-600"
        bgColor="bg-blue-50"
      />
      <ValueCard 
        icon={<Heart size={28}/>} 
        title="Сэтгэл ханамж" 
        desc="Бид мартагдашгүй сэтгэгдэл үлдээхийг хамгийн түрүүнд эрмэлздэг." 
        color="text-rose-600"
        bgColor="bg-rose-50"
      />
   </div>
</section>

        {/* 4. LOCATIONS & CONTACT */}
        <section className="bg-white border border-gray-100 rounded-[50px] p-8 md:p-16 shadow-2xl shadow-gray-200/50">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              <div>
                 <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-8">Холбоо барих</h3>
                 <div className="space-y-6">
                    <ContactItem icon={<MapPin/>} title="Хаяг" info="Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо, Бага тойрог"/>
                    <ContactItem icon={<Phone/>} title="Утас" info="8097 9624, 7733-7733"/>
                    <div className="flex gap-4 pt-6">
                       <Link href="https://www.facebook.com/Unurflowers" className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                          <Facebook size={24}/>
                       </Link>
                       <Link href="https://www.instagram.com/unurflowers_" className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-rose-500 hover:bg-rose-500 hover:text-white transition-all">
                          <Instagram size={24}/>
                       </Link>
                    </div>
                 </div>
              </div>
              <div className="space-y-6">
                 <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400">Манай салбарууд</h4>
                 <div className="space-y-4">
                    <BranchItem name="Төв салбар" time="09:00 - 21:00" desc="Бага тойрог, Драмын театрын эсрэг талд"/>
                    <BranchItem name="Наадам Центр салбар" time="10:00 - 22:00" desc="ХУД, 15-р хороо, Наадам Центр, 1 давхарт"/>
                 </div>
              </div>
           </div>
        </section>

      </div>
    </div>
  );
}

// ТУСЛАХ КОМПОНЕНТУУД
function ValueCard({ icon, title, desc, color, bgColor }: any) {
  return (
    // md:w-full (Компьютерт бүтэн өргөн), w-[280px] (Утсан дээр тогтмол өргөн)
    <div className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[40px] border border-gray-50 shadow-sm flex-shrink-0 w-[260px] md:w-full snap-center group transition-all duration-500 hover:shadow-xl">
       <div className={`${bgColor} ${color} w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <h4 className="text-lg md:text-xl font-black uppercase tracking-tighter mb-3 md:mb-4 leading-tight">{title}</h4>
       <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function ContactItem({ icon, title, info }: any) {
  return (
    <div className="flex items-start gap-4">
       <div className="p-3 bg-gray-50 rounded-xl text-gray-400">{icon}</div>
       <div>
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">{title}</p>
          <p className="text-lg font-bold text-gray-800">{info}</p>
       </div>
    </div>
  );
}

function BranchItem({ name, time, desc }: any) {
  return (
    <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100">
       <div className="flex justify-between items-center mb-2">
          <h5 className="font-black uppercase text-sm tracking-tight text-gray-900">{name}</h5>
          <span className="text-[10px] font-bold text-[#8BB711] bg-white px-2 py-1 rounded-lg border border-green-50 shadow-sm">{time}</span>
       </div>
       <p className="text-xs text-gray-400 font-medium">{desc}</p>
    </div>
  );
}