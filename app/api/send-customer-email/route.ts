import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { orderId, customerEmail, totalAmount } = await request.json();

    if (!customerEmail || !orderId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://growroom.mn';
    const trackingUrl = `${siteUrl}/order/${orderId}`;
    const shortId = orderId.substring(0, 8).toUpperCase();
    const formattedAmount = Number(totalAmount).toLocaleString();

    const mailOptions = {
      from: `"Grow Room 🌸" <${process.env.GMAIL_USER}>`,
      to: customerEmail,
      subject: `✅ Төлбөр амжилттай — Захиалга #${shortId}`,
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin: 0; padding: 0; background-color: #f8f5f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8f5f2; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 480px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #87A96B 0%, #6B8F50 100%); padding: 32px 30px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;">Grow Room 🌿</h1>
              <p style="margin: 8px 0 0 0; color: rgba(255,255,255,0.85); font-size: 13px;">Цэцэг хүргэлтийн онлайн дэлгүүр</p>
            </td>
          </tr>

          <!-- Success Icon -->
          <tr>
            <td style="text-align: center; padding: 30px 30px 10px 30px;">
              <div style="display: inline-block; width: 56px; height: 56px; background-color: #E8F5E9; border-radius: 50%; line-height: 56px; font-size: 28px;">✅</div>
              <h2 style="margin: 16px 0 4px 0; color: #1a1a1a; font-size: 20px; font-weight: 700;">Төлбөр амжилттай!</h2>
              <p style="margin: 0; color: #888; font-size: 13px;">Таны захиалгыг хүлээн авлаа</p>
            </td>
          </tr>

          <!-- Order Info Card -->
          <tr>
            <td style="padding: 16px 30px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #FAFAF8; border-radius: 12px; border: 1px solid #f0ede8;">
                <tr>
                  <td style="padding: 18px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 6px;">Захиалгын дугаар</td>
                        <td style="color: #999; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; padding-bottom: 6px; text-align: right;">Нийт дүн</td>
                      </tr>
                      <tr>
                        <td style="color: #1a1a1a; font-size: 17px; font-weight: 800;">#${shortId}</td>
                        <td style="color: #87A96B; font-size: 17px; font-weight: 800; text-align: right;">${formattedAmount}₮</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA Button -->
          <tr>
            <td style="padding: 10px 30px 10px 30px; text-align: center;">
              <a href="${trackingUrl}" style="display: inline-block; background: linear-gradient(135deg, #87A96B 0%, #6B8F50 100%); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 700; padding: 14px 40px; border-radius: 12px; letter-spacing: 0.3px;">
                📦 Захиалга хянах
              </a>
            </td>
          </tr>

          <!-- Link fallback -->
          <tr>
            <td style="padding: 6px 30px 24px 30px; text-align: center;">
              <p style="margin: 0; color: #bbb; font-size: 11px;">Товчлуур ажиллахгүй бол доорх линкийг хуулна уу:</p>
              <p style="margin: 4px 0 0 0; color: #87A96B; font-size: 11px; word-break: break-all;">${trackingUrl}</p>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 30px;">
              <hr style="border: none; border-top: 1px solid #f0ede8; margin: 0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 30px 28px 30px; text-align: center;">
              <p style="margin: 0 0 4px 0; color: #ccc; font-size: 11px;">Энэ имэйл нь автоматаар илгээгдсэн болно.</p>
              <p style="margin: 0; color: #ccc; font-size: 11px;">© ${new Date().getFullYear()} Grow Room • growroom.mn</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Customer email sending error:', error);
    return NextResponse.json({ success: false, error: 'Failed to send email' }, { status: 500 });
  }
}
