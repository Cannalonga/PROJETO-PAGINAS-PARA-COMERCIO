'use client'

import { useCallback, useState } from 'react'
import {
  ImageMetadata,
  validateImageFile,
  getImageDimensions,
  compressImage,
  formatImageMetadata,
  UploadProgress,
} from '@/lib/image-handler'

interface UseImageUploadOptions {
  pageId: string
  tenantId: string
  onSuccess?: (image: ImageMetadata) => void
  onError?: (error: string) => void
}

export function useImageUpload({
  pageId,
  tenantId,
  onSuccess,
  onError,
}: UseImageUploadOptions) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  })

  const uploadImage = useCallback(
    async (file: File) => {
      setUploading(true)
      try {
        // Validate
        const validation = validateImageFile(file)
        if (!validation.valid) {
          throw new Error(validation.error || 'Invalid file')
        }

        setProgress({ loaded: 25, total: 100, percentage: 25 })

        // Get dimensions
        const dimensions = await getImageDimensions(file)

        setProgress({ loaded: 50, total: 100, percentage: 50 })

        // Compress
        const compressed = await compressImage(file)

        setProgress({ loaded: 75, total: 100, percentage: 75 })

        // Format metadata
        const url = URL.createObjectURL(compressed)
        const metadata = formatImageMetadata(
          file,
          dimensions,
          url,
          tenantId,
          pageId
        )

        setProgress({ loaded: 100, total: 100, percentage: 100 })

        onSuccess?.(metadata)
        return metadata
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Upload failed'
        onError?.(errorMsg)
        throw error
      } finally {
        setUploading(false)
        setProgress({ loaded: 0, total: 0, percentage: 0 })
      }
    },
    [pageId, tenantId, onSuccess, onError]
  )

  return {
    uploadImage,
    uploading,
    progress,
  }
}

export default useImageUpload
