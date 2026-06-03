import { NextResponse } from "next/server";
import axios from "axios";
import { getQPayToken } from "@/lib/qpay";

// Нэхэмжлэх (Invoice) үүсгэх API
export async function POST(request: Request) {
    try {
        // Вэбсайтын Frontend-ээс ирэх мэдээллийг унших
        const { amount, orderId } = await request.json();

        // 1. Token авна (cached)
        const token = await getQPayToken();

        // 2. QPay-д илгээх Body-г бэлдэнэ
        const invoiceData = {
            invoice_code: "GROW_ROOM_INVOICE",
            sender_invoice_no: orderId,
            invoice_receiver_code: "TERMINAL",
            amount: amount.toString(), // amount string байх шаардлагатай байж болно
            invoice_description: `Grow Room - Захиалга #${orderId}`,
            // Төлбөр төлөгдөхөд QPay-ээс дуудах хаяг
            callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://growroom.mn'}/api/qpay/callback?orderId=${orderId}`,
        };

        // 3. QPay v2 API руу хүсэлт илгээнэ
        const response = await axios.post(
            "https://merchant.qpay.mn/v2/invoice",
            invoiceData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // 4. Үр дүнг Frontend рүү буцаана (qr_text, urls, invoice_id гэх мэт)
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("QPay Invoice Error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: "Нэхэмжлэх үүсгэж чадсангүй", details: error.response?.data },
            { status: 500 }
        );
    }
}
