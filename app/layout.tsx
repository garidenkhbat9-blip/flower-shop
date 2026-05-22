import type { Metadata } from "next";
import { Montserrat, Playfair_Display, Cormorant_Garamond, Caveat } from "next/font/google";
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

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["cyrillic", "latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://growroom.mn'),
  title: "Grow room | Цэцэг хүргэлтийн онлайн дэлгүүр",
  description: "Хамгийн шинэхэн цэцэгсийг таны хайртай хүнд хүргэж өгнө.",
  keywords: ["цэцэг хүргэлт", "цэцгийн дэлгүүр", "grow room", "улаанбаатар цэцэг", "цэцэг захиалга", "grow room florist"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.jpg", type: "image/jpeg", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-icon.jpg", sizes: "180x180", type: "image/jpeg" }
    ],
  },
  openGraph: {
    title: "Grow room | Цэцэг хүргэлтийн онлайн дэлгүүр",
    description: "Хамгийн шинэхэн цэцэгсийг таны хайртай хүнд хүргэж өгнө.",
    url: "/",
    siteName: "Grow Room Florist",
    images: [
      {
        url: "/logo.jpg",
        width: 1200,
        height: 630,
        alt: "Grow Room Logo",
      },
    ],
    locale: "mn_MN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Grow room | Цэцэг хүргэлтийн онлайн дэлгүүр",
    description: "Хамгийн шинэхэн цэцэгсийг таны хайртай хүнд хүргэж өгнө.",
    images: ["/logo.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="mn">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FlowerShop",
              "name": "Grow Room Florist",
              "image": "https://growroom.mn/logo.jpg",
              "@id": "https://growroom.mn/#store",
              "url": "https://growroom.mn",
              "telephone": "+97699932671",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Ulaanbaatar Galleria, 2-р давхар",
                "addressLocality": "Ulaanbaatar",
                "postalCode": "14200",
                "addressCountry": "MN"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": 47.9189,
                "longitude": 106.9176
              },
              "openingHoursSpecification": {
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday"
                ],
                "opens": "09:00",
                "closes": "21:00"
              },
              "sameAs": [
                "https://www.facebook.com/profile.php?id=61559804052197",
                "https://www.instagram.com/grow_room"
              ]
            })
          }}
        />
      </head>
      <body className={`${montserrat.variable} ${playfair.variable} ${cormorant.variable} ${caveat.variable} antialiased font-montserrat`}>
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