import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import convert from "heic-convert";
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Ensure persistent disk cache directory exists
const CACHE_DIR = path.join(process.cwd(), ".next", "cache", "heic-converted");
try {
  if (!fs.existsSync(CACHE_DIR)) {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
  }
} catch (e) {
  console.error("Failed to create image cache directory:", e);
}

/**
 * API route to proxy and convert images that browsers can't display natively
 * (e.g., HEIC/HEIF files from iOS devices).
 * 
 * Usage: /api/image-proxy?url=<firebase-storage-url>
 * 
 * Includes persistent disk caching so HEIC conversion runs ONCE per image,
 * making all subsequent loads instantaneous (1ms).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const lowerUrl = imageUrl.toLowerCase();
    const isHeic = lowerUrl.includes(".heic") || lowerUrl.includes(".heif");

    if (isHeic) {
      // Create unique hash key from URL
      const hashKey = crypto.createHash("md5").update(imageUrl).digest("hex");
      const cacheFilePath = path.join(CACHE_DIR, `${hashKey}.jpg`);

      // 1. Return from disk cache immediately if present (1ms response)
      if (fs.existsSync(cacheFilePath)) {
        const cachedJpeg = fs.readFileSync(cacheFilePath);
        return new NextResponse(new Uint8Array(cachedJpeg), {
          status: 200,
          headers: {
            "Content-Type": "image/jpeg",
            "Cache-Control": "public, max-age=31536000, immutable",
            "CDN-Cache-Control": "public, max-age=31536000",
          },
        });
      }

      // 2. Fetch original HEIC from Firebase Storage
      const response = await fetch(imageUrl, {
        headers: { "Accept": "image/*" },
      });

      if (!response.ok) {
        return NextResponse.json(
          { error: `Failed to fetch image: ${response.status}` },
          { status: response.status }
        );
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      let jpegBuffer: Buffer;

      try {
        // Try sharp first (fastest)
        jpegBuffer = await sharp(buffer)
          .jpeg({ quality: 85, mozjpeg: true })
          .toBuffer();
      } catch (sharpError) {
        console.warn("Sharp HEIC conversion failed, falling back to heic-convert:", sharpError);
        // Fallback to heic-convert (handles HEVC/HEIC variations via WASM)
        jpegBuffer = await convert({
          buffer: buffer,
          format: "JPEG",
          quality: 0.85,
        });

        // Resize converted JPEG with sharp if sharp can process JPEG buffer (makes image smaller and faster to load)
        try {
          jpegBuffer = await sharp(jpegBuffer)
            .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 85, mozjpeg: true })
            .toBuffer();
        } catch (_) {}
      }

      // 3. Save converted JPEG to disk cache for future instant loads
      try {
        fs.writeFileSync(cacheFilePath, jpegBuffer);
      } catch (cacheWriteErr) {
        console.error("Failed to write to disk cache:", cacheWriteErr);
      }

      return new NextResponse(new Uint8Array(jpegBuffer), {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=31536000, immutable",
          "CDN-Cache-Control": "public, max-age=31536000",
        },
      });
    }

    // For non-HEIC images, pass through directly
    const response = await fetch(imageUrl, {
      headers: { "Accept": "image/*" },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const buffer = Buffer.from(await response.arrayBuffer());

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": contentType || "image/jpeg",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image proxy error:", error);
    return NextResponse.json(
      { error: "Failed to process image" },
      { status: 500 }
    );
  }
}
