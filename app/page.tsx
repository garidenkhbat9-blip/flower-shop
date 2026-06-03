import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
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

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

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
          {products.map((product) => (
            <li key={product.id}>
              <a href={`/products/${product.id}`}>
                {product.name} - {(product.discountedPrice ?? product.price).toLocaleString()}₮
              </a>
            </li>
          ))}
        </ul>
        <h2>Ангилалууд</h2>
        <ul>
          {categories.map((cat) => (
            <li key={cat.id}>
              <a href={`/products?category=${encodeURIComponent(cat.name)}`}>{cat.name}</a>
            </li>
          ))}
        </ul>
      </div>

      {/* Client-side interactive UI */}
      <HomeClient
        initialProducts={JSON.parse(JSON.stringify(products))}
        initialCategories={JSON.parse(JSON.stringify(categories))}
      />
    </>
  );
}