import { NextResponse } from "next/server";
import { sendPaymentEmails } from "@/lib/qpay";

export async function POST(request: Request) {
    try {
        const { orderId, totalAmount, shippingInfo, userId } = await request.json();

        if (!orderId) {
            return NextResponse.json(
                { error: "orderId шаардлагатай." },
                { status: 400 }
            );
        }

        // Имэйл мэдэгдлийг илгээх (deduplication-той тул зөвхөн нэг л удаа илгээгдэнэ)
        await sendPaymentEmails({ orderId, totalAmount, shippingInfo, userId });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("QPay Notify Route Error:", error.message);
        return NextResponse.json(
            { error: "Мэдэгдэл илгээхэд алдаа гарлаа" },
            { status: 500 }
        );
    }
}
