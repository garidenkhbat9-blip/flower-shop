import { Timestamp } from "firebase/firestore";

export interface Category {
  id?: string;
  name: string;
  imageUrl: string;
  createdAt: Timestamp;
}

export interface Product {
  id?: string;
  name: string;
  price: number;
  discountedPrice?: number | null;
  description: string; 
  careInstructions: string;  
  imageUrls: string[];
  

 packaging: string;        // Баглаа, Сагстай, Хайрцагтай
  colors: string[];         // ["Улаан", "Ягаан"]
  size: "Жижиг" | "Дунд" | "Том";
  tags: string[];           // ["Ээждээ", "Хайртайдаа", "Баяр хүргэх"]
  stemCount?: number;

  category: string[]; 
  inStock: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  imageUrl?: string; 
}

export interface Order {
  id?: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: "Хүлээгдэж буй" | "Төлбөр төлөгдсөн" | "Хүргэлтэнд гарсан" | "Хүргэгдсэн" | "Цуцлагдсан";
  shippingAddress: {
    name: string;
    phone: string;
    addressDetail?: string; 
  };
  orderDate: Timestamp;
  deliveryDate?: Timestamp | null;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string | null;
  phoneNumber?: string | null;
  defaultShippingAddress?: {
    name: string;
    phone: string;
    addressDetail: string;
  } | null;
  createdAt: Timestamp;
  lastLogin: Timestamp;
  isAdmin: boolean;
  likedProducts?: string[];
  recentlyViewedProducts?: {
    productId: string;
    viewedAt: Timestamp;
  }[];
}

export interface CartItem extends OrderItem {
}