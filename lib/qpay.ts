import axios from "axios";

// Токен хадгалах хувьсагчууд (Next.js server-side memory)
let cachedToken: string | null = null;
let tokenExpiresAt: number = 0; // Milliseconds

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
