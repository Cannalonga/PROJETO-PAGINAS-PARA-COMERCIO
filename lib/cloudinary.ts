import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
}

/**
 * Faz upload de uma imagem para o Cloudinary
 * @param buffer - Buffer da imagem
 * @param folder - Pasta no Cloudinary (ex: 'vitrinafast/stores')
 * @returns Resultado do upload com URL otimizada
 */
export async function uploadImage(
  buffer: Buffer,
  folder: string = 'vitrinafast'
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        // Otimizações automáticas
        transformation: [
          { quality: 'auto:good' }, // Qualidade automática
          { fetch_format: 'auto' }, // Formato automático (webp quando possível)
        ],
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format,
          });
        } else {
          reject(new Error('Upload falhou sem erro específico'));
        }
      }
    );

    uploadStream.end(buffer);
  });
}

/**
 * Deleta uma imagem do Cloudinary
 * @param publicId - ID público da imagem
 */
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

/**
 * Gera URL otimizada para uma imagem
 * @param publicId - ID público da imagem
 * @param options - Opções de transformação
 */
export function getOptimizedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: 'fill' | 'fit' | 'scale' | 'thumb';
  } = {}
): string {
  return cloudinary.url(publicId, {
    secure: true,
    quality: 'auto',
    fetch_format: 'auto',
    ...options,
  });
}

export default cloudinary;
