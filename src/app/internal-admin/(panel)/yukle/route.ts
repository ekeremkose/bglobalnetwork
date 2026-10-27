import { NextResponse, type NextRequest } from "next/server";
import { getAdminSession } from "@/lib/auth/guard";
import { MAX_UPLOAD_BYTES, processCoverImage } from "@/lib/media/coverImage";
import { MediaConfigError, blob } from "@/lib/media/blob";

export const dynamic = "force-dynamic";

const notFound = () => new NextResponse(null, { status: 404, headers: { "cache-control": "no-store" } });
const json = (body: Record<string, unknown>, status: number) =>
  NextResponse.json(body, { status, headers: { "cache-control": "no-store" } });

/** Reel cover upload. Administrator only: anyone else gets the same 404 as any unknown URL. */
export async function POST(request: NextRequest) {
  if (!(await getAdminSession())) return notFound();

  // The session cookie is SameSite=Lax; this additionally rejects a cross-origin form post.
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return notFound();

  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_UPLOAD_BYTES + 64 * 1024) return json({ message: "Dosya çok büyük (en fazla 5 MB)." }, 413);

  let file: File | null = null;
  try {
    const entry = (await request.formData()).get("file");
    if (entry instanceof File) file = entry;
  } catch {
    return json({ message: "İstek okunamadı." }, 400);
  }
  if (!file) return json({ message: "Bir görsel dosyası seçin." }, 400);

  const processed = await processCoverImage(Buffer.from(await file.arrayBuffer()));
  if (!processed.ok) return json({ message: processed.message }, 422);

  try {
    const url = await blob().put(`reels/cover.${processed.extension}`, processed.bytes, processed.contentType);
    return json({ url, width: processed.width, height: processed.height }, 201);
  } catch (err) {
    if (err instanceof MediaConfigError) return json({ message: err.message }, 503);
    console.error("[upload]", err instanceof Error ? err.message : "error");
    return json({ message: "Görsel yüklenemedi. Tekrar deneyin." }, 502);
  }
}
