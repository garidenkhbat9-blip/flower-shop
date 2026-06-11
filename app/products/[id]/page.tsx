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
  return { title: "Бүтээгдэхүүн | Grow Room - Цэцэг хүргэлт" };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <ProductDetailClient
      productId={id}
    />
  );
}