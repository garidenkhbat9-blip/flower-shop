"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Truck, CreditCard, Flower2, RefreshCcw, MessageCircle, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function FAQPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const faqData = [
    {
      category: "Хүргэлт",
      icon: <Truck size={20} />,
      questions: [
        { q: "Хүргэлт ямар хугацаанд очих вэ?", a: "Бид захиалга баталгаажсанаас хойш Улаанбаатар хот дотор 30-90 минутын дотор хүргэж өгдөг. Оргил ачааллын үеэр (Баярын өдрүүд) 2-3 цаг болох магадлалтай." },
        { q: "Хүргэлтийн төлбөр хэд вэ?", a: "Хүргэлтийн үндсэн төлбөр хотын төв бүсэд 5,000₮. Алслагдсан дүүргүүдээс хамаарч төлбөр өөрчлөгдөж болно." },
        { q: "Оройн цагаар хүргэлт хийх үү?", a: "Тийм ээ, манай хүргэлт өдөр бүр 09:00 - 22:00 цагийн хооронд ажилладаг." }
      ]
    },
    {
      category: "Төлбөр тооцоо",
      icon: <CreditCard size={20} />,
      questions: [
        { q: "Ямар хэлбэрээр төлбөр төлөх боломжтой вэ?", a: "Та бүх төрлийн банкны аппликейшн, Qpay болон Social Pay-ээр төлбөрөө төлөх боломжтой." },
        { q: "Нэхэмжлэх авч болох уу?", a: "Тийм ээ, та байгууллагаар захиалга өгч байгаа бол бид e-barimt болон шаардлагатай нэхэмжлэхийг илгээж болно." }
      ]
    },
    {
      category: "Бүтээгдэхүүн & Арчилгаа",
      icon: <Flower2 size={20} />,
      questions: [
        { q: "Цэцгийг хэрхэн удаан шинээр нь хадгалах вэ?", a: "Цэцгийн ишийг 45 градусын налуу тайрч, өдөр бүр усыг нь сольж, нарны шууд тусгалаас хол байлгах хэрэгтэй." },
        { q: "Зураг дээрхтэйгээ яг ижилхэн ирэх үү?", a: "Тийм ээ, манай цэцэгчид зураг дээрх загварын дагуу бэлддэг. Гэхдээ улирлын чанартай зарим цэцэг байхгүй тохиолдолд тантай холбогдож ижил төстэй цэцгээр орлуулдаг." }
      ]
    },
    {
      category: "Буцаалт & Цуцлалт",
      icon: <RefreshCcw size={20} />,
      questions: [
        { q: "Захиалга цуцлах боломжтой юу?", a: "Захиалга хүргэлтэнд гарахаас 2 цагийн өмнө цуцлах боломжтой. Баглаа боодол бэлэн болсон тохиолдолд цуцлах боломжгүйг анхаарна уу." },
        { q: "Буцаалт хийж болох уу?", a: "Цэцэг бол амархан мууддаг бүтээгдэхүүн тул хүлээн авснаас хойш буцаах боломжгүй. Хэрэв чанарын шаардлага хангаагүй бол бид шууд сольж өгөх болно." }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-24 font-sans">
      
      {/* 1. HEADER SECTION */}
      <div className="bg-white border-b border-gray-100 px-6 py-16 md:py-24 text-center">
         <div className="max-w-7xl mx-auto">
            <span className="text-[#8BB711] font-black text-[10px] uppercase tracking-[0.4em] mb-4 block">Help Center</span>
            <h1 className="text-4xl md:text-6xl font-black uppercase italic tracking-tighter leading-none mb-8">
               Түгээмэл <br /> <span className="text-gray-300">асуултууд</span>
            </h1>
            
            {/* Search Input */}
            <div className="max-w-xl mx-auto relative group">
               <input 
                 type="text" 
                 placeholder="Асуултаа эндээс хайгаарай..." 
                 className="w-full bg-gray-50 border border-gray-100 rounded-[20px] py-5 px-8 outline-none focus:ring-2 focus:ring-[#8BB711]/20 focus:bg-white transition-all font-medium"
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
               <div className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg">
                  <HelpCircle size={20} />
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 mt-16 md:mt-24">
        
        {/* 2. FAQ ACCORDIONS */}
        <div className="space-y-16">
          {faqData.map((section, idx) => (
            <div key={idx} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${idx * 100}ms` }}>
              <div className="flex items-center gap-4 mb-8">
                 <div className="w-12 h-12 bg-gray-50 text-[#8BB711] rounded-2xl flex items-center justify-center border border-gray-100">
                    {section.icon}
                 </div>
                 <h2 className="text-xl font-black uppercase tracking-tight text-gray-900 italic">{section.category}</h2>
              </div>

              <div className="space-y-3">
                {section.questions.filter(item => 
                  item.q.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((item, qIdx) => (
                  <FAQItem key={qIdx} question={item.q} answer={item.a} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* 3. CONTACT CTA */}
        <div className="mt-32 bg-black rounded-[40px] p-8 md:p-16 text-center text-white shadow-2xl shadow-gray-400">
           <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic mb-4">Өөрийн хариултыг олж чадсангүй юу?</h3>
           <p className="text-gray-400 text-sm md:text-base mb-10 max-w-lg mx-auto">
              Манай операторууд танд туслахад хэзээд бэлэн байна. Та бидэнтэй шууд холбогдож асуултаа асуугаарай.
           </p>
           <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="bg-[#8BB711] text-white px-10 py-5 rounded-[20px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-[#7aa00f] transition shadow-lg shadow-green-900/20">
                 ХОЛБОО БАРИХ <MessageCircle size={18}/>
              </Link>
              <a href="tel:80979624" className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 rounded-[20px] font-black uppercase text-xs tracking-widest flex items-center justify-center gap-2 hover:bg-white/20 transition">
                 ШУУД ЗАЛГАХ <ChevronRight size={18}/>
              </a>
           </div>
        </div>

      </div>
    </div>
  );
}

// FAQ ITEM COMPONENT (Accordion)
function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className={`bg-white border rounded-[24px] overflow-hidden transition-all duration-300 ${isOpen ? 'border-[#8BB711] shadow-xl shadow-green-500/5' : 'border-gray-100 hover:border-gray-200'}`}
    >
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 text-left flex items-center justify-between gap-4"
      >
        <span className={`text-sm md:text-base font-bold transition-colors ${isOpen ? 'text-[#8BB711]' : 'text-gray-800'}`}>
          {question}
        </span>
        <div className={`p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-[#8BB711] text-white rotate-180' : 'bg-gray-50 text-gray-400'}`}>
           <ChevronDown size={18} />
        </div>
      </button>
      
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
         <div className="px-6 pb-6 pt-2">
            <p className="text-gray-500 text-sm md:text-base leading-relaxed font-medium">
               {answer}
            </p>
         </div>
      </div>
    </div>
  );
}