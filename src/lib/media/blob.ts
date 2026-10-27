import { del, put } from "@vercel/blob";

/** Where uploaded files live. Vercel Blob in every deployed environment; tests inject a fake. */
export interface BlobDriver {
  put(pathname: string, bytes: Buffer, contentType: string): Promise<string>;
  del(url: string): Promise<void>;
}

export class MediaConfigError extends Error {}

let injected: BlobDriver | null = null;
/** For tests and scripts only. */
export function setBlobDriver(d: BlobDriver | null) {
  injected = d;
}

/** Hosts of Vercel Blob public URLs: https://<store-id>.public.blob.vercel-storage.com/… */
export const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export function isManagedBlobUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const u = new URL(value);
    return u.protocol === "https:" && u.hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

/** A cover this application uploaded (upload route stores them as reels/cover-<suffix>.webp). */
export function isOwnedCoverUrl(value: string | undefined): value is string {
  if (!isManagedBlobUrl(value)) return false;
  return new URL(value).pathname.startsWith("/reels/cover");
}

export function blob(): BlobDriver {
  if (injected) return injected;
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new MediaConfigError(
      "Kalıcı medya depolaması (Vercel Blob) bu ortamda yapılandırılmadı. Yerel dosya sistemine kayıt yapılmaz."
    );
  }
  return {
    async put(pathname, bytes, contentType) {
      const res = await put(pathname, bytes, { access: "public", contentType, addRandomSuffix: true, token });
      return res.url;
    },
    async del(url) {
      await del(url, { token });
    },
  };
}

/** Best-effort removal of a file we uploaded; a failure must never fail the content change that triggered it. */
export async function deleteManagedBlob(url: string | undefined) {
  if (!isManagedBlobUrl(url)) return;
  try {
    await blob().del(url);
  } catch (err) {
    console.error("[media] could not delete", err instanceof Error ? err.message : "error");
  }
}
