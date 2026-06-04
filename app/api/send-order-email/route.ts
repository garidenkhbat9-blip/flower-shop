import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { orderId, orderData } = await request.json();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Хэрэглэгчийн захиалсан бараануудын жагсаалт
    const itemsHtml = orderData.items.map((item: any) => 
      `<li>${item.name} - ${item.quantity}ш (${(item.price * item.quantity).toLocaleString()}₮)</li>`
    ).join('');

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER, // Өөрийнхөө имэйл рүү илгээнэ
      subject: `🎉 Шинэ захиалга: #${orderId.substring(0, 8).toUpperCase()}`,
      html: `
        <div style="font-family: sans-serif; color: #111; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eaeaea; border-radius: 10px;">
          <h2 style="color: #87A96B; margin-bottom: 20px;">Шинэ захиалга ирлээ!</h2>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 5px solid ${orderData.shippingInfo.deliveryType === 'pickup' ? '#E28743' : '#87A96B'};">
            <p style="margin: 5px 0;"><strong>Захиалгын ID:</strong> #${orderId}</p>
            <p style="margin: 5px 0;"><strong>Нийт дүн:</strong> ${orderData.totalAmount.toLocaleString()}₮</p>
            <p style="margin: 5px 0;"><strong>Төлөв:</strong> ${orderData.paymentStatus}</p>
            <p style="margin: 5px 0; font-size: 16px;"><strong>Хүргэлтийн хэлбэр:</strong> <span style="color: ${orderData.shippingInfo.deliveryType === 'pickup' ? '#E28743' : '#87A96B'}; font-weight: bold; font-size: 18px;">${orderData.shippingInfo.deliveryType === 'pickup' ? '🏃‍♂️ ОЧИЖ АВАХ (САЛБАРААС)' : '🚚 ХҮРГЭЛТЭЭР АВАХ'}</span></p>
          </div>

          <h3 style="border-bottom: 1px solid #eaeaea; padding-bottom: 8px;">Хүргэлтийн мэдээлэл</h3>
          <p><strong>Сонголт:</strong> <span style="font-weight: bold; color: ${orderData.shippingInfo.deliveryType === 'pickup' ? '#E28743' : '#87A96B'}; font-size: 15px;">${orderData.shippingInfo.deliveryType === 'pickup' ? '🏃‍♂️ Очиж авах' : '🚚 Хүргүүлэх'}</span></p>
          <p><strong>Хүргэх өдөр:</strong> ${orderData.shippingInfo.deliveryDate}</p>
          <p><strong>Илгээгч:</strong> ${orderData.shippingInfo.senderName} (${orderData.shippingInfo.senderPhone})</p>
          <p><strong>Хүлээн авагч:</strong> ${orderData.shippingInfo.recipientName} (${orderData.shippingInfo.recipientPhone})</p>
          <p><strong>Хаяг:</strong> ${orderData.shippingInfo.deliveryType === 'pickup' ? 'Салбараас авах (Төв дэлгүүр)' : orderData.shippingInfo.district + ', ' + orderData.shippingInfo.khoroo + ', ' + orderData.shippingInfo.building + ' байр, ' + orderData.shippingInfo.apartmentNumber + ' тоот'}</p>
          
          <h3 style="border-bottom: 1px solid #eaeaea; padding-bottom: 8px; margin-top: 20px;">Барааны жагсаалт</h3>
          <ul>
            ${itemsHtml}
          </ul>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}
