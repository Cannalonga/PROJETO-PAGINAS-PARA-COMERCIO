'use client'

import React, { useRef, useState } from 'react'
import {
  validateImageFile,
  getImageDimensions,
  compressImage,
  formatImageMetadata,
  ALLOWED_MIME_TYPES,
  UploadProgress,
} from '@/lib/image-handler'

interface ImageUploaderProps {
  pageId: string
  tenantId: string
  onUploadComplete: (metadata: any) => void
  onError?: (error: string) => void
  disabled?: boolean
  multiple?: boolean
}

export function ImageUploader({
  pageId,
  tenantId,
  onUploadComplete,
  onError,
  disabled = false,
  multiple = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress>({
    loaded: 0,
    total: 0,
    percentage: 0,
  })
  const [dragActive, setDragActive] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setUploading(true)
    try {
      // Validate
      const validation = validateImageFile(file)
      if (!validation.valid) {
        onError?.(validation.error || 'Invalid file')
        return
      }

      // Get dimensions
      const dimensions = await getImageDimensions(file)

      // Compress
      setProgress({ loaded: 50, total: 100, percentage: 50 })
      const compressed = await compressImage(file)

      // Create metadata
      const url = URL.createObjectURL(compressed)
      const metadata = formatImageMetadata(file, dimensions, url, tenantId, pageId)

      // Simulate upload to API
      await new Promise((resolve) => setTimeout(resolve, 500))

      setProgress({ loaded: 100, total: 100, percentage: 100 })
      onUploadComplete(metadata)

      // Reset
      setTimeout(() => {
        setUploading(false)
        setProgress({ loaded: 0, total: 0, percentage: 0 })
        if (inputRef.current) inputRef.current.value = ''
      }, 500)
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Upload failed')
      setUploading(false)
    }
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files) {
      const file = files[0]
      await handleFile(file)
    }
  }

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files) {
      const file = e.dataTransfer.files[0]
      await handleFile(file)
    }
  }

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_MIME_TYPES.join(',')}
          onChange={handleChange}
          disabled={disabled || uploading}
          multiple={multiple}
          className="hidden"
        />

        <button
          onClick={() => inputRef.current?.click()}
          disabled={disabled || uploading}
          className="text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-medium"
        >
          {uploading ? '📤 Uploading...' : '📁 Click to upload or drag and drop'}
        </button>

        <p className="text-sm text-gray-500 mt-2">
          PNG, JPG, WebP or GIF (max 10MB)
        </p>

        {uploading && (
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <p className="text-sm text-gray-600 mt-2">{progress.percentage}%</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageUploader
