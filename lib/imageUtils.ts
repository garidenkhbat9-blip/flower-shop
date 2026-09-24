/**
 * Client-side image compression utility.
 * Compresses images before uploading to Firebase Storage
 * to dramatically reduce file sizes and improve load times.
 * Also handles HEIC/HEIF conversion for iOS uploads.
 */

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 to 1
}

/**
 * Check if a file is in HEIC/HEIF format (commonly from iOS devices).
 */
function isHeicFile(file: File): boolean {
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return (
    name.endsWith(".heic") ||
    name.endsWith(".heif") ||
    type === "image/heic" ||
    type === "image/heif"
  );
}

/**
 * Convert a HEIC/HEIF file to JPEG using heic2any library.
 * This is loaded dynamically to avoid bloating the main bundle.
 */
async function convertHeicToJpeg(file: File): Promise<File> {
  // Dynamic import to keep bundle size small
  const heic2any = (await import("heic2any")).default;

  const blob = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.92,
  });

  // heic2any can return a single blob or an array of blobs
  const resultBlob = Array.isArray(blob) ? blob[0] : blob;

  const newName = file.name.replace(/\.(heic|heif)$/i, ".jpg");
  return new File([resultBlob], newName, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}

/**
 * Compress a single image file using Canvas API.
 * Converts to WebP format for better compression.
 * Default: max 1200px width, 0.8 quality → typically 60-80% size reduction.
 * 
 * Automatically handles HEIC/HEIF files by converting them first.
 */
export async function compressImage(
  file: File,
  options: CompressOptions = {}
): Promise<File> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.8 } = options;

  // Step 1: Convert HEIC/HEIF to JPEG first if needed
  let processableFile = file;
  if (isHeicFile(file)) {
    try {
      processableFile = await convertHeicToJpeg(file);
    } catch (err) {
      console.error("HEIC conversion failed:", err);
      throw new Error("HEIC зураг хөрвүүлэхэд алдаа гарлаа. Зургаа JPG эсвэл PNG формат руу хөрвүүлж дахин оруулна уу.");
    }
  }

  // If the file is already small (< 100KB) and not HEIC, skip compression
  if (processableFile.size < 100 * 1024 && processableFile === file) {
    return processableFile;
  }

  return new Promise((resolve, reject) => {
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
                  processableFile.name.replace(/\.[^.]+$/, ".jpg"),
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
            processableFile.name.replace(/\.[^.]+$/, ".webp"),
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
    reader.readAsDataURL(processableFile);
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
 * Automatically handles HEIC/HEIF files.
 */
export async function generateBlurPlaceholder(file: File): Promise<string> {
  // Convert HEIC first if needed
  let processableFile = file;
  if (isHeicFile(file)) {
    try {
      processableFile = await convertHeicToJpeg(file);
    } catch {
      // If conversion fails, return a default placeholder
      return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAUABQDASIAAhEBAxEB/8QAFwABAQEBAAAAAAAAAAAAAAAABgcFCP/EACYQAAIBAwMDBQEBAAAAAAAAAAECAwQFEQAGIRIxUQcTQWFxIv/EABYBAQEBAAAAAAAAAAAAAAAAAAQDAP/EABwRAQACAgMBAAAAAAAAAAAAAAEAAgMRBBIhQf/aAAwDAQACEQMRAD8A";
    }
  }

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
    reader.readAsDataURL(processableFile);
  });
}
