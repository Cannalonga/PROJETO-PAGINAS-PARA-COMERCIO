/**
 * Image Handler Library
 * Handles image upload, compression, optimization, and storage
 * Supports resizing, cropping, format conversion, and CDN integration
 */

import { nanoid } from 'nanoid'

// Types
export interface ImageUploadOptions {
  maxSize?: number // bytes
  maxWidth?: number
  maxHeight?: number
  quality?: number // 0-1
  format?: 'webp' | 'jpeg' | 'png'
}

export interface ImageDimensions {
  width: number
  height: number
  aspectRatio: number
}

export interface ImageCropData {
  x: number
  y: number
  width: number
  height: number
  rotate?: number
}

export interface ImageMetadata {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  dimensions: ImageDimensions
  url: string
  thumbnailUrl?: string
  uploadedAt: Date
  pageId?: string
  tenantId: string
}

export interface ImageLibraryItem {
  id: string
  imageId: string
  pageId: string
  tenantId: string
  name: string
  usage: 'page-background' | 'block-image' | 'gallery' | 'thumbnail'
  addedAt: Date
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

// Constants
export const DEFAULT_IMAGE_OPTIONS: ImageUploadOptions = {
  maxSize: 10 * 1024 * 1024, // 10MB
  maxWidth: 2000,
  maxHeight: 2000,
  quality: 0.8,
  format: 'webp',
}

export const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]

export const COMPRESSION_LEVELS = {
  HIGH: { quality: 0.6, maxWidth: 800, maxHeight: 800 },
  MEDIUM: { quality: 0.75, maxWidth: 1200, maxHeight: 1200 },
  LOW: { quality: 0.9, maxWidth: 1600, maxHeight: 1600 },
}

// Utility Functions

/**
 * Validate image file
 */
export function validateImageFile(
  file: File,
  options: ImageUploadOptions = DEFAULT_IMAGE_OPTIONS
): { valid: boolean; error?: string } {
  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_MIME_TYPES.join(', ')}`,
    }
  }

  // Check file size
  if (options.maxSize && file.size > options.maxSize) {
    return {
      valid: false,
      error: `File size exceeds ${options.maxSize / 1024 / 1024}MB limit`,
    }
  }

  return { valid: true }
}

/**
 * Generate unique image ID
 */
export function generateImageId(): string {
  return `img_${nanoid(12)}`
}

/**
 * Get image dimensions from file
 */
export async function getImageDimensions(
  file: File
): Promise<ImageDimensions> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const width = img.naturalWidth
        const height = img.naturalHeight
        resolve({
          width,
          height,
          aspectRatio: width / height,
        })
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Compress image file
 */
export async function compressImage(
  file: File,
  options: ImageUploadOptions = DEFAULT_IMAGE_OPTIONS
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        // Calculate new dimensions
        let newWidth = img.naturalWidth
        let newHeight = img.naturalHeight

        if (options.maxWidth && newWidth > options.maxWidth) {
          const scale = options.maxWidth / newWidth
          newWidth = options.maxWidth
          newHeight = newHeight * scale
        }

        if (options.maxHeight && newHeight > options.maxHeight) {
          const scale = options.maxHeight / newHeight
          newHeight = options.maxHeight
          newWidth = newWidth * scale
        }

        // Create canvas and draw compressed image
        const canvas = document.createElement('canvas')
        canvas.width = newWidth
        canvas.height = newHeight

        const ctx = canvas.getContext('2d')
        if (!ctx) reject(new Error('Canvas context failed'))

        ctx!.drawImage(img, 0, 0, newWidth, newHeight)

        // Convert to blob with quality setting
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Blob conversion failed'))
          },
          options.format === 'webp' ? 'image/webp' : file.type,
          options.quality
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Generate thumbnail from image
 */
export async function generateThumbnail(
  file: File,
  width: number = 200,
  height: number = 200
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) reject(new Error('Canvas context failed'))

        // Fill background and draw centered image
        ctx!.fillStyle = '#f0f0f0'
        ctx!.fillRect(0, 0, width, height)

        const scale = Math.min(
          width / img.naturalWidth,
          height / img.naturalHeight
        )
        const x = (width - img.naturalWidth * scale) / 2
        const y = (height - img.naturalHeight * scale) / 2

        ctx!.drawImage(
          img,
          x,
          y,
          img.naturalWidth * scale,
          img.naturalHeight * scale
        )

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Blob conversion failed'))
          },
          'image/webp',
          0.8
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Crop image based on crop data
 */
export async function cropImage(
  file: File,
  cropData: ImageCropData
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = cropData.width
        canvas.height = cropData.height

        const ctx = canvas.getContext('2d')
        if (!ctx) reject(new Error('Canvas context failed'))

        // Apply rotation if needed
        if (cropData.rotate) {
          ctx!.translate(cropData.width / 2, cropData.height / 2)
          ctx!.rotate((cropData.rotate * Math.PI) / 180)
          ctx!.translate(-cropData.width / 2, -cropData.height / 2)
        }

        // Draw cropped image
        ctx!.drawImage(
          img,
          cropData.x,
          cropData.y,
          cropData.width,
          cropData.height,
          0,
          0,
          cropData.width,
          cropData.height
        )

        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob)
            else reject(new Error('Blob conversion failed'))
          },
          'image/webp',
          0.85
        )
      }
      img.onerror = () => reject(new Error('Failed to load image'))
      img.src = event.target?.result as string
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Calculate optimal compression level based on dimensions
 */
export function getOptimalCompressionLevel(
  dimensions: ImageDimensions
): keyof typeof COMPRESSION_LEVELS {
  if (dimensions.width > 1600 || dimensions.height > 1600) return 'HIGH'
  if (dimensions.width > 1200 || dimensions.height > 1200) return 'MEDIUM'
  return 'LOW'
}

/**
 * Format image metadata
 */
export function formatImageMetadata(
  file: File,
  dimensions: ImageDimensions,
  url: string,
  tenantId: string,
  pageId?: string
): ImageMetadata {
  return {
    id: generateImageId(),
    filename: `${generateImageId()}.webp`,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    dimensions,
    url,
    uploadedAt: new Date(),
    pageId,
    tenantId,
  }
}

/**
 * Create image library item
 */
export function createImageLibraryItem(
  imageId: string,
  pageId: string,
  tenantId: string,
  name: string,
  usage: ImageLibraryItem['usage']
): ImageLibraryItem {
  return {
    id: nanoid(),
    imageId,
    pageId,
    tenantId,
    name,
    usage,
    addedAt: new Date(),
  }
}

/**
 * Calculate image statistics
 */
export interface ImageStats {
  totalSize: number
  compressionRatio: number
  estimatedBandwidth: number
}

export function calculateImageStats(
  originalSize: number,
  compressedSize: number,
  estimatedRequests: number = 100
): ImageStats {
  const compressionRatio = ((1 - compressedSize / originalSize) * 100).toFixed(
    1
  ) as unknown as number
  const estimatedBandwidth = (compressedSize * estimatedRequests) / 1024 / 1024 // MB

  return {
    totalSize: compressedSize,
    compressionRatio,
    estimatedBandwidth,
  }
}

/**
 * Build CDN URL (placeholder for actual CDN integration)
 */
export function buildCdnUrl(
  imageId: string,
  width?: number,
  height?: number,
  quality?: number
): string {
  const params = new URLSearchParams()
  if (width) params.set('w', width.toString())
  if (height) params.set('h', height.toString())
  if (quality) params.set('q', quality.toString())

  const queryString = params.toString()
  const baseUrl = `/api/images/${imageId}`
  return queryString ? `${baseUrl}?${queryString}` : baseUrl
}

/**
 * Validate image dimensions for specific use cases
 */
export function validateDimensionsForUsage(
  dimensions: ImageDimensions,
  usage: 'hero' | 'thumbnail' | 'gallery' | 'background'
): { valid: boolean; error?: string } {
  const rules: Record<string, { minWidth: number; minHeight: number }> = {
    hero: { minWidth: 1200, minHeight: 400 },
    thumbnail: { minWidth: 200, minHeight: 200 },
    gallery: { minWidth: 400, minHeight: 300 },
    background: { minWidth: 800, minHeight: 600 },
  }

  const rule = rules[usage]
  if (!rule) return { valid: false, error: 'Unknown usage type' }

  if (dimensions.width < rule.minWidth || dimensions.height < rule.minHeight) {
    return {
      valid: false,
      error: `Image too small for ${usage}. Min: ${rule.minWidth}x${rule.minHeight}`,
    }
  }

  return { valid: true }
}

/**
 * Extract image metadata from file
 */
export async function extractImageMetadata(file: File) {
  const validation = validateImageFile(file)
  if (!validation.valid) throw new Error(validation.error)

  const dimensions = await getImageDimensions(file)
  const compressionLevel = getOptimalCompressionLevel(dimensions)

  return {
    file,
    dimensions,
    validation,
    compressionLevel,
    suggestedOptions: COMPRESSION_LEVELS[compressionLevel],
  }
}

// Export all compression presets
export const IMAGE_PRESETS = {
  AVATAR: { maxWidth: 200, maxHeight: 200, quality: 0.9 },
  THUMBNAIL: { maxWidth: 300, maxHeight: 300, quality: 0.85 },
  SMALL: { maxWidth: 600, maxHeight: 600, quality: 0.8 },
  MEDIUM: { maxWidth: 1000, maxHeight: 1000, quality: 0.8 },
  LARGE: { maxWidth: 1600, maxHeight: 1600, quality: 0.75 },
  HERO: { maxWidth: 2000, maxHeight: 1200, quality: 0.8 },
}
