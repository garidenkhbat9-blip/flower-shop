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

export const revalidate = 600; // Revalidate every 10 minutes

async function getProducts(): Promise<Product[]> {
  try {
    const prodSnap = await getDocs(collection(db, "products"));
    return prodSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[];
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const catSnap = await getDocs(collection(db, "categories"));
    return catSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Category[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export default async function AllProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <ProductsPageClient
      initialProducts={JSON.parse(JSON.stringify(products))}
      initialCategories={JSON.parse(JSON.stringify(categories))}
    />
  );
}