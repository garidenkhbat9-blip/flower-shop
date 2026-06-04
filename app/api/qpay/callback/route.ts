import { NextResponse } from "next/server";
import { checkQPayPayment, processOrderPayment } from "@/lib/qpay";

export async function POST(request: Request) {
    try {
        const url = new URL(request.url);
        const orderId = url.searchParams.get("orderId");

        const qpayData = await request.json();
        const { invoice_id } = qpayData;

        if (!invoice_id) {
            return NextResponse.json(
                { error: "invoice_id олдсонгүй" },
                { status: 400 }
            );
        }

        // 1. QPay-ээс төлбөрийн статусыг шалгах
        const checkResult = await checkQPayPayment(invoice_id);

        // 2. Хэрэв төлөгдсөн бол Firestore-д бүртгэж, имэйл илгээх
        const isPaid = orderId ? await processOrderPayment(orderId, checkResult) : false;

        if (isPaid) {
            return NextResponse.json({ success: true, message: "Payment confirmed and emails sent" });
        }

        return NextResponse.json({ success: false, message: "Payment not paid yet" });

    } catch (error: any) {
        console.error("Callback Route Error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: "Төлбөр шалгахад алдаа гарлаа" },
            { status: 500 }
        );
    }
}
