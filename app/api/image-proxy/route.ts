import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import convert from "heic-convert";

/**
 * API route to proxy and convert images that browsers can't display natively
 * (e.g., HEIC/HEIF files from iOS devices).
 * 
 * Usage: /api/image-proxy?url=<firebase-storage-url>
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    // Fetch the original image from Firebase Storage
    const response = await fetch(imageUrl, {
      headers: {
        "Accept": "image/*",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch image: ${response.status}` },
        { status: response.status }
      );
    }

    const contentType = response.headers.get("content-type") || "";
    const buffer = Buffer.from(await response.arrayBuffer());

    // Check if this is a HEIC/HEIF file (by URL extension or content type)
    const isHeic =
      imageUrl.toLowerCase().includes(".heic") ||
      imageUrl.toLowerCase().includes(".heif") ||
      contentType.includes("heic") ||
      contentType.includes("heif");

    if (isHeic) {
      let jpegBuffer: Buffer;
      try {
        // Try sharp first (fastest)
        jpegBuffer = await sharp(buffer)
          .jpeg({ quality: 85, mozjpeg: true })
          .toBuffer();
      } catch (sharpError) {
        console.warn("Sharp HEIC conversion failed, falling back to heic-convert:", sharpError);
        // Fallback to heic-convert (handles all HEVC/HEIC variations via libheif WASM)
        jpegBuffer = await convert({
          buffer: buffer,
          format: "JPEG",
          quality: 0.85,
        });
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

    // For non-HEIC images, pass through as-is
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
