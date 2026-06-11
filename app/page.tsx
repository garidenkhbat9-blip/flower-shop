import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { Product, Category } from "@/types";
import HomeClient from "@/components/HomeClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grow Room | Цэцэг хүргэлтийн онлайн дэлгүүр - Улаанбаатар",
  description:
    "Grow Room нь Улаанбаатар хотод цэцэг хүргэлтийн үйлчилгээ үзүүлдэг онлайн дэлгүүр. Шинэхэн цэцгийн баглаа, бэлгийн шийдэл, захиалгат үйлчилгээ. Хамгийн шинэхэн цэцэгсийг таны хайртай хүнд хүргэж өгнө.",
  keywords: [
    "цэцэг хүргэлт",
    "цэцгийн дэлгүүр",
    "grow room",
    "улаанбаатар цэцэг",
    "цэцэг захиалга",
    "grow room florist",
    "цэцэг онлайн",
    "цэцгийн баглаа",
    "бэлгийн цэцэг",
    "Улаанбаатар цэцгийн дэлгүүр",
  ],
  alternates: {
    canonical: "/",
  },
};

export default function HomePage() {
  return (
    <>
      {/* SEO: Server-rendered content for Google crawlers */}
      <div className="sr-only" aria-hidden="false">
        <h1>Grow Room - Цэцэг хүргэлтийн онлайн дэлгүүр | Улаанбаатар</h1>
        <p>
          Grow Room нь Улаанбаатар Галлериад байрлах орчин үеийн цэцгийн дэлгүүр бөгөөд 
          онцгой мөч бүрт зориулсан шинэхэн цэцгийн баглаа, бэлгийн шийдэл, захиалгат үйлчилгээ үзүүлдэг.
          Хамгийн шинэхэн цэцэгсийг таны хайртай хүнд хүргэж өгнө.
        </p>
        <h2>Бидний бүтээгдэхүүнүүд</h2>
        <ul>
            <li>
              <a href={`/products`}>
                Онлайн хүргэлт
              </a>
            </li>
        </ul>
        <h2>Ангилалууд</h2>
        <ul>
            <li>
              <a href={`/products`}>Бүх ангилал</a>
            </li>
        </ul>
      </div>

      {/* Client-side interactive UI fetches data incredibly fast */}
      <HomeClient initialProducts={undefined} initialCategories={undefined} />
    </>
  );
}