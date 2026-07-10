// Utilitários de imagem no cliente: resize e compressão para manter base64 pequeno

/** Redimensiona uma imagem (File ou data URL) para max 800px e retorna data URL JPEG */
export async function resizeImage(
  source: File | string,
  maxSize = 800,
  quality = 0.82
): Promise<string> {
  let dataUrl: string;
  if (typeof source === 'string') {
    dataUrl = source;
  } else {
    dataUrl = await fileToDataUrl(source);
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > height && width > maxSize) {
        height = Math.round((height * maxSize) / width);
        width = maxSize;
      } else if (height > maxSize) {
        width = Math.round((width * maxSize) / height);
        height = maxSize;
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas não suportado'));
        return;
      }
      // fundo branco para PNGs transparentes
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Falha ao carregar imagem'));
    img.src = dataUrl;
  });
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Falha ao ler arquivo'));
    reader.readAsDataURL(file);
  });
}
