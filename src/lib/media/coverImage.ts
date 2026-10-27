import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const ACCEPTED = new Set(["jpeg", "png", "webp", "avif", "gif"]);
const MAX_INPUT_PIXELS = 40_000_000;

export type CoverResult =
  | { ok: true; bytes: Buffer; contentType: "image/webp"; extension: "webp"; width: number; height: number }
  | { ok: false; message: string };

/**
 * Accepts only real raster images: the file is decoded, not trusted by name or declared type.
 * The stored copy is a re-encoded WebP bounded to the Reel cover size, with EXIF/location data
 * dropped, so a hostile or oversized file never reaches storage.
 */
export async function processCoverImage(input: Buffer): Promise<CoverResult> {
  if (input.length === 0) return { ok: false, message: "Dosya boş." };
  if (input.length > MAX_UPLOAD_BYTES) {
    return { ok: false, message: `Dosya çok büyük (en fazla ${MAX_UPLOAD_BYTES / 1024 / 1024} MB).` };
  }
  try {
    const image = sharp(input, { limitInputPixels: MAX_INPUT_PIXELS, failOn: "error" });
    const meta = await image.metadata();
    if (!meta.format || !ACCEPTED.has(meta.format)) {
      return { ok: false, message: "Desteklenen görsel türleri: JPG, PNG, WebP, AVIF, GIF." };
    }
    const { data, info } = await image
      .rotate()
      .resize({ width: 1080, height: 1920, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true });
    return { ok: true, bytes: data, contentType: "image/webp", extension: "webp", width: info.width, height: info.height };
  } catch {
    return { ok: false, message: "Dosya geçerli bir görsel olarak okunamadı." };
  }
}
