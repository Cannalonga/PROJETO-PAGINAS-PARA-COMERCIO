'use client'

import React, { useState, useEffect } from 'react'
import { cropImage, ImageCropData } from '@/lib/image-handler'

interface ImageCropperProps {
  file: File
  aspectRatio?: number
  onCropComplete: (croppedBlob: Blob, cropData: ImageCropData) => void
  onCancel: () => void
}

export function ImageCropper({
  file,
  aspectRatio = 16 / 9,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const [imageSrc, setImageSrc] = useState<string>('')
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })
  const [cropBox, setCropBox] = useState({
    x: 0,
    y: 0,
    width: 400,
    height: 300,
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragHandle, setDragHandle] = useState<string>('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const src = e.target?.result as string
      setImageSrc(src)

      const img = new Image()
      img.onload = async () => {
        setDimensions({ width: img.naturalWidth, height: img.naturalHeight })

        const maxWidth = 800
        const displayHeight = (maxWidth / img.naturalWidth) * img.naturalHeight

        setCropBox({
          x: 0,
          y: 0,
          width: Math.min(maxWidth, img.naturalWidth),
          height: Math.min(displayHeight, img.naturalHeight * 0.75),
        })
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }, [file])

  const handleMouseDown = (
    _e: React.MouseEvent<HTMLDivElement>,
    handle: string
  ) => {
    setIsDragging(true)
    setDragHandle(handle)
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return

    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const minSize = 100
    const newBox = { ...cropBox }

    if (dragHandle === 'move') {
      newBox.x = Math.max(0, Math.min(x, dimensions.width - cropBox.width))
      newBox.y = Math.max(0, Math.min(y, dimensions.height - cropBox.height))
    } else if (dragHandle === 'se') {
      const newWidth = Math.max(minSize, x - cropBox.x)
      const newHeight = newWidth / aspectRatio
      if (cropBox.x + newWidth <= dimensions.width &&
        cropBox.y + newHeight <= dimensions.height) {
        newBox.width = newWidth
        newBox.height = newHeight
      }
    }

    setCropBox(newBox)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setDragHandle('')
  }

  const handleCrop = async () => {
    setIsProcessing(true)
    try {
      const croppedBlob = await cropImage(file, cropBox)
      onCropComplete(croppedBlob, cropBox)
    } catch (error) {
      console.error('Crop failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!imageSrc) {
    return <div className="text-center py-8">Loading image...</div>
  }

  return (
    <div className="w-full bg-white rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Crop Image</h3>

      <div
        className="relative inline-block bg-gray-100 overflow-hidden"
        style={{ maxWidth: '100%' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={imageSrc}
          alt="Crop preview"
          className="w-full h-auto block"
          style={{ pointerEvents: 'none' }}
        />

        {/* Crop Box */}
        <div
          className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10 cursor-move"
          style={{
            left: `${(cropBox.x / dimensions.width) * 100}%`,
            top: `${(cropBox.y / dimensions.height) * 100}%`,
            width: `${(cropBox.width / dimensions.width) * 100}%`,
            height: `${(cropBox.height / dimensions.height) * 100}%`,
          }}
          onMouseDown={(e) => handleMouseDown(e, 'move')}
        >
          {/* Resize handle */}
          <div
            className="absolute w-4 h-4 bg-blue-500 rounded-full bottom-0 right-0 transform translate-x-1/2 translate-y-1/2 cursor-se-resize"
            onMouseDown={(e) => {
              e.stopPropagation()
              handleMouseDown(e, 'se')
            }}
          />
        </div>
      </div>

      <div className="mt-4 flex gap-3">
        <button
          onClick={handleCrop}
          disabled={isProcessing}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isProcessing ? '⏳ Processing...' : '✅ Crop'}
        </button>
        <button
          onClick={onCancel}
          disabled={isProcessing}
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          ❌ Cancel
        </button>
      </div>
    </div>
  )
}

export default ImageCropper
