/**
 * Client-side image compression utility.
 * Compresses images before uploading to Firebase Storage
 * to dramatically reduce file sizes and improve load times.
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1
}

/**
 * Compress a single image file using Canvas API.
 * Converts to WebP format for better compression.
 * Default: max 1200px width, 0.8 quality → typically 60-80% size reduction.
 */
export function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = options;

  return new Promise((resolve, reject) => {
    // If the file is already small (< 100KB), skip compression
    if (file.size < 100 * 1024) {
      resolve(file);
      return;
    }

    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      let { width, height } = img;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      canvas.width = width;
      canvas.height = height;

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      // Draw with high-quality rendering
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Try WebP first, fall back to JPEG
      const outputType = "image/webp";
      
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            // Fallback: if WebP fails, try JPEG
            canvas.toBlob(
              (jpegBlob) => {
                if (!jpegBlob) {
                  reject(new Error("Image compression failed"));
                  return;
                }
                const compressedFile = new File(
                  [jpegBlob],
                  file.name.replace(/\.[^.]+$/, ".jpg"),
                  { type: "image/jpeg", lastModified: Date.now() }
                );
                resolve(compressedFile);
              },
              "image/jpeg",
              quality
            );
            return;
          }

          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, ".webp"),
            { type: outputType, lastModified: Date.now() }
          );
          resolve(compressedFile);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => reject(new Error("Failed to load image"));

    // Read the file as data URL
    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress multiple image files in parallel.
 */
export async function compressImages(
  files: File[],
  options?: CompressOptions
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}

/**
 * Generate a tiny thumbnail for use as a blur placeholder.
 * Returns a base64 data URL (typically < 1KB).
 */
export function generateBlurPlaceholder(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {
      // Very small for blur effect
      canvas.width = 20;
      canvas.height = 20;

      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }

      ctx.drawImage(img, 0, 0, 20, 20);
      resolve(canvas.toDataURL("image/jpeg", 0.3));
    };

    img.onerror = () => reject(new Error("Failed to load image"));

    const reader = new FileReader();
    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}
