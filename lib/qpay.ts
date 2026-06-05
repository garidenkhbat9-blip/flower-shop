import axios from "axios";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import nodemailer from "nodemailer";
import * as admin from "firebase-admin";
import fs from "fs";
import path from "path";

// Safe initialization of Firebase Admin SDK
let adminDb: any = null;
try {
    if (!admin.apps.length) {
        const serviceAccountPath = path.join(process.cwd(), "service-account.json");
        if (fs.existsSync(serviceAccountPath)) {
            console.log("Found local service-account.json, initializing Admin SDK...");
            const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } else {
            console.log("Initializing Firebase Admin SDK using Application Default Credentials...");
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        }
    }
    adminDb = admin.firestore();
} catch (err) {
    console.warn("Firebase Admin SDK could not be initialized (expected in local dev if service-account.json is missing):", err);
}

// Токен хадгалах хувьсагчууд (Next.js server-side memory)
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0; // Milliseconds

// Gmail transporter setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,         // growroom.flower@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD, // 16 тэмдэгттэй Google App Password
    },
});

export async function getQPayToken(): Promise<string> {
    const now = Date.now();

    // Хэрвээ token байвал, мөн хугацаа нь дуусахад 10 секундээс их хугацаа үлдсэн байвал cache-с буцаана
    if (cachedToken && tokenExpiresAt > now + 10000) {
        console.log("Returning cached QPay token...");
        return cachedToken;
    }

    const username = process.env.QPAY_USERNAME;
    const password = process.env.QPAY_PASSWORD;

    if (!username || !password) {
        throw new Error("QPay credentials are not configured in environment variables.");
    }

    const authHeader = Buffer.from(`${username}:${password}`).toString("base64");

    try {
        console.log("Fetching new QPay token...");
        const response = await axios.post(
            "https://merchant.qpay.mn/v2/auth/token",
            {},
            {
                headers: {
                    Authorization: `Basic ${authHeader}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const data = response.data;
        cachedToken = data.access_token;
        // expires_in нь ихэвчлэн секундээр ирнэ (жишээ нь: 2592000 секунд)
        const expiresInMs = (data.expires_in || 3600) * 1000;
        
        tokenExpiresAt = Date.now() + expiresInMs;

        return cachedToken!;
    } catch (error: any) {
        console.error("QPay Token Error:", error.response?.data || error.message);
        throw new Error("QPay token авч чадсангүй");
    }
}

/**
 * QPay-ээс тухайн нэхэмжлэх төлөгдсөн эсэхийг шалгах
 */
export async function checkQPayPayment(invoiceId: string): Promise<any> {
    const token = await getQPayToken();
    const response = await axios.post(
        "https://merchant.qpay.mn/v2/payment/check",
        {
            object_type: "INVOICE",
            object_id: invoiceId,
            offset: { page_number: 1, page_limit: 100 }
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );
    return response.data;
}

// Тогтмол мэйл илгээсэн захиалгуудыг хадгалах (in-memory deduplication)
const sentEmailOrders = new Set<string>();

/**
 * Захиалгын төлбөр баталгаажсан имэйлүүдийг админ болон хэрэглэгч рүү илгээх.
 * Давхардаж олон имэйл очихоос сэргийлсэн deduplication механизмтай.
 */
export async function sendPaymentEmails({
    orderId,
    totalAmount,
    shippingInfo,
    userId
}: {
    orderId: string;
    totalAmount: number;
    shippingInfo: any;
    userId: string;
}): Promise<void> {
    if (sentEmailOrders.has(orderId)) {
        console.log(`Emails already sent for order ${orderId}, skipping.`);
        return;
    }

    sentEmailOrders.add(orderId);

    const customerEmail = shippingInfo?.senderEmail;
    const isGuest = userId === "guest";

    // 1. АДМИН РҮҮ ШИНЭ ЗАХИАЛГЫН МЭДЭЭЛЭЛ ИЛГЭЭХ
    try {
        const isPickup = shippingInfo?.deliveryType === 'pickup';
        const adminMailOptions = {
            from: `"Grow Room System" <${process.env.GMAIL_USER}>`,
            to: "growroom.flower@gmail.com",
            subject: `🚨 Grow Room - ШИНЭ ЗАХИАЛГА ТӨЛӨГДЛӨӨ (#${orderId.substring(0, 8).toUpperCase()})`,
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #87A96B; border-radius: 8px;">
                    <h2 style="color: #87A96B;">💰 QPay Төлбөр Баталгаажлаа!</h2>
                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 5px solid ${isPickup ? '#E28743' : '#87A96B'};">
                        <p style="margin: 5px 0;"><strong>Захиалгын ID:</strong> #${orderId}</p>
                        <p style="margin: 5px 0;"><strong>Нийт дүн:</strong> ${totalAmount.toLocaleString()}₮</p>
                        <p style="margin: 5px 0;"><strong>Төлөв:</strong> <span style="color: #22c55e; font-weight: bold;">Төлөгдсөн</span></p>
                        <p style="margin: 5px 0; font-size: 16px;"><strong>Хүргэлтийн хэлбэр:</strong> <span style="color: ${isPickup ? '#E28743' : '#87A96B'}; font-weight: bold; font-size: 18px;">${isPickup ? '🏃‍♂️ ОЧИЖ АВАХ (САЛБАРААС)' : '🚚 ХҮРГЭЛТЭЭР АВАХ'}</span></p>
                    </div>
                    <p>Админ самбар руугаа орж хүргэлтийн хаяг болон цэцгийн мэдээллийг шалгана уу.</p>
                    <a href="https://growroom.mn" style="background-color: #87A96B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 10px;">Админ самбар нээх</a>
                </div>
            `,
        };
        await transporter.sendMail(adminMailOptions);
        console.log(`Админд мэдэгдэл имэйл амжилттай очлоо. Order ID: ${orderId}`);
    } catch (adminEmailErr) {
        console.error("Админ руу имэйл илгээхэд алдаа:", adminEmailErr);
    }

    // 2. ЗӨВХӨН БҮРТГЭЛГҮЙ ЗОЧИНД ХЯНАХ ЛИНК ИЛГЭЭХ
    const isEmailLikelyValid = (email: string) => {
        if (!email) return false;
        const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!re.test(email)) return false;
        const lower = email.toLowerCase();
        if (lower.includes('@gmial.') || lower.includes('@gamil.') || lower.includes('@gmail.con') || lower.includes('@yaho.')) return false;
        return true;
    };

    if (isGuest && customerEmail && isEmailLikelyValid(customerEmail)) {
        try {
            const trackingLink = `${process.env.NEXT_PUBLIC_SITE_URL || "https://growroom.mn"}/order/${orderId}`;
            const customerMailOptions = {
                from: `"Grow Room" <${process.env.GMAIL_USER}>`,
                to: customerEmail,
                subject: `🌸 Grow Room - Таны захиалга #${orderId} баталгаажлаа`,
                html: `
                    <div style="font-family: sans-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
                        <h2 style="color: #4A5568;">Сайн байна уу? Таны төлбөр амжилттай төлөгдлөө.🌸</h2>
                        <p>Захиалгын дугаар: <strong>#${orderId}</strong></p>
                        <p>Нийт дүн: <strong>${totalAmount.toLocaleString()}₮</strong></p>
                        <p>Та доорх линкээр орж хүргэлтийн төлөвөө хэдийд ч хянах боломжтой:</p>
                        <br/>
                        <a href="${trackingLink}" style="background-color: #ec4899; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                            Захиалга хянах линк
                        </a>
                        <br/><br/>
                        <p style="font-size: 12px; color: #718096;">Хөтөч дээрээ нээх хаяг: ${trackingLink}</p>
                    </div>
                `,
            };
            await transporter.sendMail(customerMailOptions);
            console.log(`Зочин хэрэглэгч рүү хянах линк илгээлээ: ${customerEmail}`);
        } catch (customerEmailErr) {
            console.error("Хэрэглэгч руу имэйл илгээхэд алдаа:", customerEmailErr);
        }
    }
}

/**
 * Захиалгын төлбөр амжилттай төлөгдсөн бол Firestore шинэчилж имэйл мэдэгдэл илгээнэ.
 * Дахин дахин имэйл илгээхээс сэргийлж өмнө нь төлөгдсөн эсэхийг шалгана.
 */
export async function processOrderPayment(orderId: string, checkResult: any): Promise<boolean> {
    // Хэрэв ядаж 1 төлбөр олдсон эсвэл төлсөн дүн нь 0-ээс их байвал:
    if (checkResult.count > 0 || checkResult.paid_amount > 0) {
        let isAlreadyPaid = false;
        let customerEmail = "";
        let isGuest = false;
        let totalAmount = 0;
        let shippingInfo: any = null;
        let userId = "";

        // 1. Try reading order using Admin SDK first (bypasses security rules)
        if (adminDb) {
            try {
                const docSnap = await adminDb.collection("orders").doc(orderId).get();
                if (docSnap.exists) {
                    const orderData = docSnap.data();
                    isAlreadyPaid = orderData.paymentStatus === "Төлөгдсөн";
                    customerEmail = orderData.shippingInfo?.senderEmail || "";
                    isGuest = orderData.userId === "guest";
                    totalAmount = orderData.totalAmount || 0;
                    shippingInfo = orderData.shippingInfo || null;
                    userId = orderData.userId || "";
                } else {
                    console.warn(`Order ${orderId} not found via Admin SDK.`);
                }
            } catch (adminReadErr) {
                console.error("Firebase Admin SDK read failed:", adminReadErr);
            }
        }

        // 2. Fallback to Client SDK for reading order
        if (!customerEmail && !isAlreadyPaid) {
            try {
                const orderRef = doc(db, "orders", orderId);
                const orderSnap = await getDoc(orderRef);
                if (orderSnap.exists()) {
                    const orderData = orderSnap.data();
                    isAlreadyPaid = orderData.paymentStatus === "Төлөгдсөн";
                    customerEmail = orderData.shippingInfo?.senderEmail || "";
                    isGuest = orderData.userId === "guest";
                    totalAmount = orderData.totalAmount || 0;
                    shippingInfo = orderData.shippingInfo || null;
                    userId = orderData.userId || "";
                }
            } catch (clientReadErr) {
                console.error("Firebase Client SDK read failed on server:", clientReadErr);
            }
        }

        // Хэрэв өмнө нь төлөгдчихсөн байвал дахин боловсруулахгүй
        if (isAlreadyPaid) {
            console.log(`Order ${orderId} is already processed as paid.`);
            return true;
        }

        // Firestore дээр төлбөрийн төлөвийг "Төлөгдсөн" болгож шинэчлэх
        let updated = false;

        // 1. Try Admin SDK write (bypasses security rules)
        if (adminDb) {
            try {
                await adminDb.collection("orders").doc(orderId).update({
                    paymentStatus: "Төлөгдсөн"
                });
                updated = true;
                console.log(`Order ${orderId} successfully updated to 'Төлөгдсөн' via Firebase Admin SDK.`);
            } catch (adminWriteErr) {
                console.error("Firebase Admin SDK update failed:", adminWriteErr);
            }
        }

        // 2. Fallback to Client SDK write (runs under rules, will fail locally but we catch it)
        if (!updated) {
            try {
                const orderRef = doc(db, "orders", orderId);
                await updateDoc(orderRef, {
                    paymentStatus: "Төлөгдсөн"
                });
                updated = true;
                console.log(`Order ${orderId} successfully updated to 'Төлөгдсөн' via Firebase Client SDK.`);
            } catch (clientWriteErr) {
                console.warn(`Firebase Client SDK update failed on server (expected in local dev):`, clientWriteErr);
            }
        }

        // ИМЭЙЛ ИЛГЭЭХ
        await sendPaymentEmails({ orderId, totalAmount, shippingInfo, userId });
        return true;
    }
    return false;
}
