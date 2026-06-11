import { db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, limit, getDocs } from "firebase/firestore";
import { Product } from "@/types";
import ProductDetailClient from "@/components/ProductDetailClient";
import Link from "next/link";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const revalidate = 600; // Revalidate every 10 minutes

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { title: "Бүтээгдэхүүн олдсонгүй | Grow Room" };
    }

    const product = docSnap.data();
    return {
      title: `${product.name} | Grow Room - Цэцэг хүргэлт`,
      description: product.description?.slice(0, 160) || `${product.name} - Grow Room цэцгийн дэлгүүр`,
      openGraph: {
        title: product.name,
        description: product.description?.slice(0, 160),
        images: product.imageUrls?.[0] ? [product.imageUrls[0]] : [],
      },
    };
  } catch {
    return { title: "Grow Room - Цэцэг хүргэлт" };
  }
}

async function getProduct(id: string): Promise<Product | null> {
  try {
    const docRef = doc(db, "products", id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;
    return { id: docSnap.id, ...docSnap.data() } as Product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

async function getRecommended(product: Product): Promise<Product[]> {
  try {
    const cats = product.categories || [];
    if (cats.length === 0) return [];

    const q = query(
      collection(db, "products"),
      where("categories", "array-contains-any", cats),
      limit(5)
    );
    const recSnap = await getDocs(q);
    return recSnap.docs
      .map((d) => ({ id: d.id, ...d.data() } as Product))
      .filter((p) => p.id !== product.id)
      .slice(0, 4);
  } catch (error) {
    console.error("Error fetching recommended:", error);
    return [];
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-white">
        <p className="text-xs font-bold uppercase tracking-widest">Бүтээгдэхүүн олдсонгүй.</p>
        <Link href="/products" className="text-xs font-bold border-b border-[#111] pb-1">Бүх бараа руу буцах</Link>
      </div>
    );
  }

  // Fetch recommended products (runs on server, fast connection to Firestore)
  const recommended = await getRecommended(product);

  return (
    <ProductDetailClient
      product={JSON.parse(JSON.stringify(product))}
      recommended={JSON.parse(JSON.stringify(recommended))}
    />
  );
}