export function publicUrl(bucket: string, path: string): string;
export function publicUrl(storagePath: string): string;
export function publicUrl(a: string, b?: string): string {
  if (!a) return "";
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return "";

  let bucket = "", p = "";
  if (typeof b === "string") {
    bucket = a;
    p = b;
  } else {
    const clean = String(a).replace(/^\/+/, "");
    const parts = clean.split("/");
    bucket = parts.shift() || "";
    p = parts.join("/");
  }
  if (!bucket || !p) return "";

  const base = supabaseUrl.replace(/\/+$/, "");
  const cleanPath = String(p).replace(/^\/+/, "");
  return `${base}/storage/v1/object/public/${bucket}/${cleanPath}`;
}
export function getPublicUrl(a: string, b?: string) {
  // @ts-expect-error intencional por overload
  return publicUrl(a, b);
}
export default publicUrl;
