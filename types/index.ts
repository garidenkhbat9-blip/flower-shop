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
  paymentStatus?: string;
  shippingAddress: {
    name: string;
    phone: string;
    addressDetail?: string;
  };
  shippingInfo?: {
    senderName?: string;
    senderPhone?: string;
    senderPhoneAlt?: string;
    senderEmail?: string;
    recipientName?: string;
    recipientPhone?: string;
    deliveryDate?: string;
    cardMessage?: string;
    deliveryType?: string;
    city?: string;
    district?: string;
    khoroo?: string;
    building?: string;
    apartmentNumber?: string;
    street?: string;
    additionalInfo?: string;
  };
  orderDate: Timestamp;
  createdAt?: Timestamp;
  deliveryDate?: Timestamp | null;
  deliveryPhoto?: string;
  deliveryStartedAt?: Timestamp | null;
  deliveredAt?: Timestamp | null;
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
  role?: "admin" | "delivery" | "user";
  likedProducts?: string[];
  recentlyViewedProducts?: {
    productId: string;
    viewedAt: Timestamp;
  }[];
}

export interface CartItem extends OrderItem {
}