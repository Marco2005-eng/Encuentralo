import { SUPABASE_URL, SUPABASE_ANON_KEY, obtenerSesionLocal } from './client';

/**
 * Sube una imagen (Blob, File o dataURL base64) al bucket 'objetos' de Supabase Storage
 * y devuelve la URL pública directa (CDN).
 */
export async function subirImagenASupabaseStorage(
  archivoODataUrl: File | string
): Promise<string> {
  const sesion = obtenerSesionLocal();
  const token = sesion?.access_token || SUPABASE_ANON_KEY;

  let blob: Blob;
  let extension = 'jpg';

  if (typeof archivoODataUrl === 'string') {
    // Si es base64 data URL: data:image/jpeg;base64,...
    const partes = archivoODataUrl.split(',');
    const matchMime = partes[0].match(/:(.*?);/);
    const mime = matchMime ? matchMime[1] : 'image/jpeg';
    if (mime.includes('png')) extension = 'png';
    else if (mime.includes('webp')) extension = 'webp';

    const bstr = atob(partes[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    blob = new Blob([u8arr], { type: mime });
  } else {
    blob = archivoODataUrl;
    if (archivoODataUrl.type.includes('png')) extension = 'png';
    else if (archivoODataUrl.type.includes('webp')) extension = 'webp';
  }

  // Generar nombre de archivo único
  const fileName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${extension}`;
  const rutaStorage = `${SUPABASE_URL}/storage/v1/object/objetos/${fileName}`;

  const res = await fetch(rutaStorage, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${token}`,
      'Content-Type': blob.type || 'image/jpeg',
      'x-upsert': 'true',
    },
    body: blob,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'No se pudo subir la fotografía a Supabase Storage.');
  }

  // Retornar la URL pública directa del archivo
  return `${SUPABASE_URL}/storage/v1/object/public/objetos/${fileName}`;
}
