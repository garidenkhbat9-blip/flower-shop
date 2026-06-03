import { NextResponse } from "next/server";
import axios from "axios";
import { getQPayToken } from "@/lib/qpay";
import { db } from "@/lib/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import nodemailer from "nodemailer";

// 1. Дэлгүүрийн Gmail тээвэрлэгчийг тохируулах
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,         // growroom.flower@gmail.com
        pass: process.env.GMAIL_APP_PASSWORD, // 16 тэмдэгттэй Google App Password
    },
});

export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        const orderId = url.searchParams.get("orderId");

        const qpayData = await request.json();
        const { invoice_id } = qpayData;

        const token = await getQPayToken();

        const checkResponse = await axios.post(
            "https://merchant.qpay.mn/v2/payment/check",
            {
                object_type: "INVOICE",
                object_id: invoice_id,
                offset: { page_number: 1, page_limit: 100 }
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const paymentResult = checkResponse.data;

        // 🔥 ЗӨВХӨН ТӨЛБӨР ҮНЭХЭЭР ТӨЛӨГДӨХӨД (PAID):
        if (paymentResult.count > 0 || paymentResult.paid_amount > 0) {

            if (orderId) {
                const orderRef = doc(db, "orders", orderId);

                // Firestore дээрх төлөвийг шинэчлэх
                await updateDoc(orderRef, {
                    paymentStatus: "Төлөгдсөн"
                });
                console.log(`Захиалга амжилттай баталгаажлаа. Order ID: ${orderId}`);

                // Firestore-оос тухайн захиалгын мэдээллийг татаж авах
                const orderSnap = await getDoc(orderRef);

                if (orderSnap.exists()) {
                    const orderData = orderSnap.data();
                    const customerEmail = orderData.shippingInfo?.senderEmail;
                    const isGuest = orderData.userId === "guest";
                    const totalAmount = orderData.totalAmount || 0;

                    // 🌸 АЛХАМ А: АДМИН РҮҮ ШИНЭ ЗАХИАЛГЫН МЭДЭЭЛЭЛ ИЛГЭЭХ
                    try {
                        const adminMailOptions = {
                            from: `"Grow Room System" <${process.env.GMAIL_USER}>`,
                            to: "growroom.flower@gmail.com", // Админ мэйл
                            subject: `🚨 Grow Room - ШИНЭ ЗАХИАЛГА ТӨЛӨГДЛӨӨ (#${orderId})`,
                            html: `
                                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #87A96B; border-radius: 8px;">
                                    <h2 style="color: #87A96B;">💰 QPay Төлбөр Баталгаажлаа!</h2>
                                    <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 15px 0;">
                                        <p style="margin: 5px 0;"><strong>Захиалгын ID:</strong> #${orderId}</p>
                                        <p style="margin: 5px 0;"><strong>Нийт дүн:</strong> ${totalAmount.toLocaleString()}₮</p>
                                        <p style="margin: 5px 0;"><strong>Төлөв:</strong> <span style="color: #22c55e; font-weight: bold;">Төлөгдсөн</span></p>
                                    </div>
                                    <p>Админ самбар руугаа орж хүргэлтийн хаяг болон цэцгийн мэдээллийг шалгана уу.</p>
                                    <a href="https://growroom.mn" style="background-color: #87A96B; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block; margin-top: 10px;">Админ самбар нээх</a>
                                </div>
                            `,
                        };
                        await transporter.sendMail(adminMailOptions);
                        console.log("Админд мэдэгдэл имэйл амжилттай очлоо.");
                    } catch (adminEmailErr) {
                        console.error("Админ руу имэйл илгээхэд алдаа:", adminEmailErr);
                    }

                    // 🌸 АЛХАМ Б: ЗӨВХӨН БҮРТГЭЛГҮЙ ЗОЧИНД ХЯНАХ ЛИНК ИЛГЭЭХ
                    if (isGuest && customerEmail) {
                        try {
                            const trackingLink = `https://growroom.mn{orderId}`;
                            const customerMailOptions = {
                                from: `"Grow Room" <${process.env.GMAIL_USER}>`,
                                to: customerEmail, // Зочин хэрэглэгчийн Gmail
                                subject: `🌸 Grow Room - Таны захиалга #${orderId} баталгаажлаа`,
                                html: `
                                    <div style="font-family: sans-serif; max-serif; padding: 20px; max-width: 600px; border: 1px solid #eee; border-radius: 8px;">
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
            } else {
                console.warn(`Төлбөр төлөгдсөн ч Order ID олдсонгүй. Invoice ID: ${invoice_id}`);
            }

            return NextResponse.json({ success: true, message: "Payment confirmed and emails sent" });
        }

        return NextResponse.json({ success: false, message: "Payment not paid yet" });

    } catch (error: any) {
        console.error("Callback Error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: "Төлбөр шалгахад алдаа гарлаа" },
            { status: 500 }
        );
    }
}
