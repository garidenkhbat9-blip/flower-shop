import { NextResponse } from "next/server";
import { checkQPayPayment, processOrderPayment } from "@/lib/qpay";

export async function POST(request: Request) {
    try {
        const { invoiceId, orderId } = await request.json();

        if (!invoiceId) {
            return NextResponse.json(
                { error: "invoiceId шаардлагатай." },
                { status: 400 }
            );
        }

        // 1. QPay-ээс төлбөрийн статусыг шалгах
        const checkResult = await checkQPayPayment(invoiceId);

        // 2. Хэрэв төлөгдсөн бол (count > 0 эсвэл paid_amount > 0)
        const isPaid = checkResult.count > 0 || checkResult.paid_amount > 0;

        // 3. Хэрэв төлөгдсөн бөгөөд orderId байвал сервер талд захиалгын статусыг шинэчилж имэйл илгээнэ
        if (isPaid && orderId) {
            await processOrderPayment(orderId, checkResult);
        }

        return NextResponse.json({ paid: isPaid });
    } catch (error: any) {
        console.error("QPay Status Check Route Error:", error.response?.data || error.message);
        return NextResponse.json(
            { error: "Төлбөр шалгахад алдаа гарлаа" },
            { status: 500 }
        );
    }
}
