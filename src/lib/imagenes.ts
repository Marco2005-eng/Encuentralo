export const TIPOS_IMAGEN = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_LADO = 800;
const CALIDAD = 0.7;

/** Redimensiona (máx. 800 px) y comprime la imagen en el cliente; devuelve un data URL JPEG. */
export function comprimirImagen(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!TIPOS_IMAGEN.includes(file.type)) {
      reject(new Error('Formato no permitido. Usa una imagen JPG, PNG o WebP.'));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const escala = Math.min(1, MAX_LADO / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * escala);
      canvas.height = Math.round(img.height * escala);
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo procesar la imagen.'));
        return;
      }
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', CALIDAD));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen. Prueba con otro archivo.'));
    };
    img.src = url;
  });
}
