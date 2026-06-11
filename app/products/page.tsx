import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Product, Category } from "@/types";
import ProductsPageClient from "@/components/ProductsPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Бүх бүтээгдэхүүн | Grow Room - Цэцэг хүргэлт",
  description:
    "Grow Room цэцгийн дэлгүүрийн бүх бүтээгдэхүүн. Шинэхэн цэцгийн баглаа, бэлгийн шийдэл, захиалгат үйлчилгээ. Улаанбаатар хот даяар хүргэлт.",
  keywords: [
    "цэцэг хүргэлт",
    "цэцгийн дэлгүүр",
    "grow room",
    "бүх бараа",
    "цэцэг захиалга",
    "цэцгийн баглаа",
  ],
  alternates: {
    canonical: "/products",
  },
};

export default function AllProductsPage() {
  return (
    <ProductsPageClient
      initialProducts={undefined}
      initialCategories={undefined}
    />
  );
}