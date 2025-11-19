'use client'

import React, { useState, useEffect } from 'react'
import { ImageMetadata } from '@/lib/image-handler'

interface ImageLibraryProps {
  pageId: string
  tenantId: string
  onImageSelect: (image: ImageMetadata) => void
  onImageDelete: (imageId: string) => void
}

export function ImageLibrary({
  pageId,
  tenantId,
  onImageSelect,
  onImageDelete,
}: ImageLibraryProps) {
  const [images, setImages] = useState<ImageMetadata[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [filterUsage, setFilterUsage] = useState<string>('all')

  useEffect(() => {
    fetchImages()
  }, [pageId, tenantId])

  const fetchImages = async () => {
    setLoading(true)
    try {
      // Fetch from API
      const response = await fetch(
        `/api/images?pageId=${pageId}&tenantId=${tenantId}`
      )
      if (response.ok) {
        const data = await response.json()
        setImages(data.images || [])
      }
    } catch (error) {
      console.error('Failed to fetch images:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (imageId: string) => {
    if (!confirm('Delete this image?')) return

    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setImages(images.filter((img) => img.id !== imageId))
        onImageDelete(imageId)
      }
    } catch (error) {
      console.error('Delete failed:', error)
    }
  }

  const filteredImages = images.filter((img) => {
    if (filterUsage === 'all') return true
    return img.url.includes(filterUsage)
  })

  if (loading) {
    return <div className="text-center py-8">Loading images...</div>
  }

  return (
    <div className="w-full bg-white rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Image Library</h3>
        <span className="text-sm text-gray-500">
          {filteredImages.length} images
        </span>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={filterUsage}
          onChange={(e) => setFilterUsage(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded hover:border-gray-400"
        >
          <option value="all">All Images</option>
          <option value="page-background">Page Background</option>
          <option value="block-image">Block Images</option>
          <option value="gallery">Gallery</option>
          <option value="thumbnail">Thumbnails</option>
        </select>
      </div>

      {/* Grid */}
      {filteredImages.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          📭 No images yet. Upload your first image!
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedImage === image.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <img
                src={image.url}
                alt={image.originalName}
                className="w-full h-32 object-cover"
                onClick={() => {
                  setSelectedImage(image.id)
                  onImageSelect(image)
                }}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-end justify-between p-2 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(image.id)
                  }}
                  className="bg-red-500 text-white px-2 py-1 rounded text-sm hover:bg-red-600"
                >
                  🗑️ Delete
                </button>
                <span className="bg-gray-800 text-white px-2 py-1 rounded text-xs">
                  {image.dimensions.width}x{image.dimensions.height}
                </span>
              </div>

              {/* Info */}
              <div className="p-2 bg-gray-50 text-xs text-gray-600 truncate">
                {image.originalName}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Selected image info */}
      {selectedImage && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <div className="text-sm">
            <p className="font-semibold">Selected Image</p>
            <p className="text-gray-600">
              {images.find((img) => img.id === selectedImage)?.originalName}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageLibrary
