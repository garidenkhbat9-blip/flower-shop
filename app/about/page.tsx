"use client";

import { motion } from "framer-motion";
import { ArrowRight, MapPin, Phone, Instagram, Facebook, Mail } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FCFBF9] selection:bg-[#1A1A1A] selection:text-white overflow-hidden">
      
      {/* 1. LUXURY HERO SECTION */}
      <section className="relative h-[40svh] md:h-[50svh] w-full flex items-center justify-center px-6 overflow-hidden">
        {/* Background Image with subtle parallax effect */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black/30 z-10" />
          <motion.img 
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1519304812571-01552210493a?q=80&w=2000" 
            className="w-full h-full object-cover"
            alt="Flower Background"
          />
        </div>
        
        <div className="relative z-20 max-w-4xl text-center">
          <motion.span 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="inline-block text-[10px] md:text-[12px] font-bold text-white uppercase tracking-[0.5em] mb-4 font-montserrat"
          >
            Since 2018 — Grow Room
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 1 }}
            className="text-[clamp(2rem,6vw,4.5rem)] font-playfair font-medium text-white leading-tight tracking-tight mb-4"
          >
            Бидний <span className="italic font-normal text-white/90">түүх</span>
          </motion.h1>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-[1px] h-8 bg-gradient-to-b from-white/60 to-transparent" />
        </motion.div>
      </section>

      {/* 2. EDITORIAL STORY SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
          
          <div className="lg:col-span-6 space-y-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <span className="text-[#87A96B] font-bold text-[10px] uppercase tracking-[0.4em] font-montserrat block">Бидний философи</span>
              <h2 className="text-4xl md:text-6xl font-playfair font-medium text-[#1A1A1A] leading-[1.1] tracking-tight">
                Цэцэг бүрт <br /> <span className="italic font-normal text-[#1A1A1A]/70">хайраа шингээдэг</span>
              </h2>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-8 text-[#1A1A1A]/60 leading-relaxed text-base md:text-lg font-montserrat font-light"
            >
              <p>
                Grow Room нь Улаанбаатар Галлериад байрлах орчин үеийн цэцгийн дэлгүүр бөгөөд онцгой мөч бүрт зориулсан шинэхэн цэцгийн баглаа, бэлгийн шийдэл, захиалгат үйлчилгээ үзүүлдэг. 
              </p>
              <p className="font-medium text-[#1A1A1A] italic">
                “Цэцэг өгөх нь авахаасаа илүү жаргалтай”
              </p>
              <p>
                Бид 2018 оноос эхлэн Улаанбаатар хотод үйл ажиллагаагаа явуулж эхэлсэн бөгөөд өдгөө цэцэг хүргэлтийн салбарт өөрийн гэсэн өнгө төрхийг бүтээж, чанар болон найдвартай байдлаараа танигдаад байна.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Link href="/products" className="group inline-flex items-center gap-6 text-[#1A1A1A] font-montserrat">
                <span className="text-[11px] font-bold uppercase tracking-[0.4em] border-b border-[#1A1A1A]/10 pb-2 group-hover:border-[#87A96B] transition-all">Цуглуулга үзэх</span>
                <div className="w-12 h-12 rounded-full border border-[#1A1A1A]/10 flex items-center justify-center group-hover:bg-[#87A96B] group-hover:border-[#87A96B] group-hover:text-white transition-all">
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          </div>

          <div className="lg:col-span-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative aspect-[4/5] bg-white p-4 md:p-8 rounded-[2px] shadow-[0_40px_100px_rgba(0,0,0,0.06)] border border-black/[0.03]"
            >
              <img 
                src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?q=80&w=1000" 
                className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700" 
                alt="Our craftsmanship"
              />
              {/* Architectural badge */}
              <div className="absolute -bottom-10 -left-10 bg-[#87A96B] text-white p-10 hidden md:block rounded-[2px] shadow-2xl">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] mb-2">Years of</p>
                <p className="text-5xl font-playfair font-medium">06</p>
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] mt-2">Excellence</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. CRAFTSMANSHIP SHOWCASE */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24">
            <span className="text-[#87A96B] font-bold text-[10px] uppercase tracking-[0.4em] font-montserrat block mb-4">Ур чадвар</span>
            <h2 className="text-4xl md:text-5xl font-playfair font-medium text-[#1A1A1A]">Яагаад Grow Room гэж?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
            <FeatureCard 
              number="01"
              title="Шинэхэн цэцэгс"
              desc="Бид өглөө бүр хамгийн шинэхэн, чанартай цэцэгсийг хүлээн авч, баглаа болгон урладаг."
            />
            <FeatureCard 
              number="02"
              title="Найдвартай хүргэлт"
              desc="Таны сэтгэлийн илэрхийлэл болсон цэцэгсийг бид Улаанбаатар хот даяар яг цагт нь хүргэдэг."
            />
            <FeatureCard 
              number="03"
              title="Онцгой дизайн"
              desc="Цэцэгчин бүр манай баглаа бүрийг дахин давтагдашгүй, урлагийн бүтээл болгохыг эрмэлздэг."
            />
          </div>
        </div>
      </section>

      {/* 4. CONTACT & LOCATION SECTION */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="bg-[#FCFBF9] border border-black/[0.03] rounded-[2px] p-8 md:p-24 shadow-[0_50px_100px_rgba(0,0,0,0.04)] relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#87A96B]/[0.03] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative z-10">
            <div className="lg:col-span-5 space-y-10">
              <h3 className="text-4xl font-playfair font-medium text-[#1A1A1A]">Холбоо барих</h3>
              <div className="space-y-8">
                <ContactItem icon={<MapPin size={18}/>} title="Салбар" info="Ulaanbaatar Galleria, 2-р давхар" />
                <ContactItem icon={<Phone size={18}/>} title="Утас" info="9993 2671" />
                <ContactItem icon={<Mail size={18}/>} title="И-мэйл" info="growroom@gmail.com" />
              </div>

              <div className="flex gap-4 pt-4">
                <SocialLink icon={<Facebook size={18}/>} href="https://facebook.com/grow_room" />
                <SocialLink icon={<Instagram size={18}/>} href="https://instagram.com/grow_room" />
              </div>
            </div>

            <div className="lg:col-span-7 h-full min-h-[400px]">
              <div className="w-full h-full bg-gray-100 rounded-[2px] overflow-hidden border border-black/[0.05]">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2673.8828607137887!2d106.91740927691651!3d47.92058007920367!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5d969248238622c5%3A0x62955f2d658c49e7!2sGalleria%20Ulaanbaatar!5e0!3m2!1sen!2smn!4v1715671234567!5m2!1sen!2smn" 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={true} 
                  loading="lazy" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ number, title, desc }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group space-y-6"
    >
      <div className="flex items-end gap-4">
        <span className="text-4xl md:text-5xl font-playfair text-[#1A1A1A]/10 group-hover:text-[#87A96B]/20 transition-colors duration-500 font-medium leading-none">{number}</span>
        <h4 className="text-xl font-bold uppercase tracking-widest text-[#1A1A1A] pb-1 font-montserrat">{title}</h4>
      </div>
      <p className="text-[#1A1A1A]/50 text-sm leading-loose font-montserrat font-light">{desc}</p>
      <div className="w-12 h-[1px] bg-[#1A1A1A]/10 group-hover:w-full group-hover:bg-[#87A96B]/30 transition-all duration-700" />
    </motion.div>
  );
}

function ContactItem({ icon, title, info }: any) {
  return (
    <div className="flex items-start gap-6">
      <div className="w-10 h-10 bg-white border border-black/[0.03] rounded-full flex items-center justify-center text-[#1A1A1A]/40 shrink-0 shadow-sm">{icon}</div>
      <div>
        <p className="text-[9px] font-black text-[#999] uppercase tracking-[0.2em] mb-1 font-montserrat">{title}</p>
        <p className="text-base font-medium text-[#1A1A1A] font-montserrat">{info}</p>
      </div>
    </div>
  );
}

function SocialLink({ icon, href }: any) {
  return (
    <Link 
      href={href} 
      target="_blank"
      className="w-12 h-12 bg-white border border-black/[0.03] rounded-full flex items-center justify-center text-[#1A1A1A]/40 hover:bg-[#1A1A1A] hover:text-white transition-all duration-500 shadow-sm"
    >
      {icon}
    </Link>
  );
}