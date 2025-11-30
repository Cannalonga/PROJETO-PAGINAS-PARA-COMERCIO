import { readFileSync } from 'fs'
import * as FileType from 'file-type'

/**
 * Upload validation - Validação segura de uploads de arquivo
 * Verifica: magic bytes, MIME type, tamanho, extensão, rejeita SVG
 */

export const UPLOAD_LIMITS = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png',
    'image/webp',
  ],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
  blockedExtensions: ['.svg', '.svgz', '.xml', '.html', '.js', '.exe'],
}

export const MIME_TYPE_MAP: Record<string, string[]> = {
  'image/jpeg': [0xff, 0xd8, 0xff],
  'image/png': [0x89, 0x50, 0x4e, 0x47],
  'image/webp': [0x52, 0x49, 0x46, 0x46], // RIFF header
}

/**
 * Verificar magic bytes (file signature)
 * Previne upload de arquivos disfarçados com extensão falsa
 */
export async function validateMagicBytes(
  buffer: Buffer,
  mimeType: string
): Promise<boolean> {
  // Converter para Uint8Array
  const bytes = new Uint8Array(buffer.slice(0, 4))

  const fileType = await FileType.fileTypeFromBuffer(buffer)

  if (!fileType) {
    return false
  }

  // Verificar se MIME type reportado bate com magic bytes
  return UPLOAD_LIMITS.allowedMimeTypes.includes(fileType.mime)
}

/**
 * Validar extensão de arquivo
 */
export function validateExtension(filename: string): boolean {
  const ext = '.' + filename.split('.').pop()?.toLowerCase()

  // Bloquear extensões perigosas
  if (UPLOAD_LIMITS.blockedExtensions.includes(ext)) {
    throw new Error(`Blocked extension: ${ext}`)
  }

  // Permitir apenas whitelisted
  return UPLOAD_LIMITS.allowedExtensions.includes(ext)
}

/**
 * Validar tamanho de arquivo
 */
export function validateFileSize(sizeBytes: number): boolean {
  if (sizeBytes > UPLOAD_LIMITS.maxSize) {
    throw new Error(
      `File too large: ${sizeBytes} > ${UPLOAD_LIMITS.maxSize} bytes`
    )
  }
  return true
}

/**
 * Validar MIME type
 */
export function validateMimeType(mimeType: string): boolean {
  if (!UPLOAD_LIMITS.allowedMimeTypes.includes(mimeType)) {
    throw new Error(`Blocked MIME type: ${mimeType}`)
  }
  return true
}

/**
 * Rejeitar SVG (potencial XSS)
 */
export function validateSvgRejection(filename: string, buffer: Buffer): boolean {
  // Check filename
  if (filename.toLowerCase().endsWith('.svg') || 
      filename.toLowerCase().endsWith('.svgz')) {
    throw new Error('SVG files not allowed (XSS risk)')
  }

  // Check content
  const content = buffer.toString('utf-8', 0, Math.min(1000, buffer.length))
  if (content.includes('<svg') || content.includes('<?xml')) {
    throw new Error('SVG content detected (XSS risk)')
  }

  return true
}

/**
 * Função principal: validar upload completo
 *
 * Uso em API route:
 * ```typescript
 * export async function POST(req: NextRequest) {
 *   const formData = await req.formData()
 *   const file = formData.get('file') as File
 *
 *   const buffer = Buffer.from(await file.arrayBuffer())
 *   const result = await validateUpload(file.name, buffer, file.type)
 *
 *   if (!result.valid) {
 *     return NextResponse.json({ error: result.error }, { status: 400 })
 *   }
 *
 *   // Upload seguro para Cloudinary/S3
 *   await uploadToCloudinary(buffer, file.name)
 *   return NextResponse.json({ success: true })
 * }
 * ```
 */
export async function validateUpload(
  filename: string,
  buffer: Buffer,
  mimeType: string
): Promise<{ valid: boolean; error?: string }> {
  try {
    // 1. Validar tamanho
    validateFileSize(buffer.length)

    // 2. Validar extensão
    validateExtension(filename)

    // 3. Validar MIME type
    validateMimeType(mimeType)

    // 4. Rejeitar SVG
    validateSvgRejection(filename, buffer)

    // 5. Validar magic bytes (assinatura de arquivo)
    const magicBytesValid = await validateMagicBytes(buffer, mimeType)
    if (!magicBytesValid) {
      return {
        valid: false,
        error: 'Invalid file signature (magic bytes mismatch)',
      }
    }

    return { valid: true }
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Sanitizar nome de arquivo para S3/Cloudinary
 * Remove caracteres especiais, previne directory traversal
 */
export function sanitizeFilename(filename: string): string {
  // Remover path separators (.. /  \)
  const sanitized = filename
    .replace(/\.\./g, '')
    .replace(/[\/\\]/g, '')
    .replace(/[^\w\s.-]/g, '')
    .trim()

  // Assegurar extensão
  if (!sanitized.includes('.')) {
    throw new Error('Invalid filename: no extension')
  }

  return sanitized
}

/**
 * Gerar nome único para arquivo (prevent collision)
 */
export function generateUniqueFilename(
  originalFilename: string,
  tenantId: string
): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = originalFilename.split('.').pop()
  return `${tenantId}/${timestamp}-${random}.${ext}`
}
