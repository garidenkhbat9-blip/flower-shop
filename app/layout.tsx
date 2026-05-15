import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import Header from "@/components/Header"; 
import Footer from "@/components/Footer";
import MobileBottomNav from "@/components/MobileBottomNav";
import { AuthProvider } from "@/context/AuthContext"; 
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { db } from "@/lib/firebase";
import CartDrawer from "@/components/CartDrawer";
import "./globals.css";
import { Analytics } from '@vercel/analytics/react';

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Grow room | Цэцэг хүргэлтийн онлайн дэлгүүр",
  description: "Хамгийн шинэхэн цэцэгсийг таны хайртай хүнд хүргэж өгнө.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <body className={`${montserrat.variable} ${playfair.variable} ${cormorant.variable} antialiased font-montserrat`}>
         <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Header />
              <CartDrawer />
              <main className="min-h-screen bg-gray-50 pb-20 md:pb-0"> 
                {children} 
                <Analytics />
              </main>        
              <Footer />
              <MobileBottomNav />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}