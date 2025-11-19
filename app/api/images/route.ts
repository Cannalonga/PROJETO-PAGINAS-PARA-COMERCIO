import { NextRequest, NextResponse } from 'next/server'
import {
  validateImageFile,
  getImageDimensions,
  compressImage,
  generateThumbnail,
  formatImageMetadata,
} from '@/lib/image-handler'
import { logAuditEvent } from '@/lib/audit'

/**
 * POST /api/images/upload
 * Upload and process image
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check placeholder
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    // Parse form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const pageId = formData.get('pageId') as string

    if (!file || !pageId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate file
    const validation = validateImageFile(file as File)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Process image
    const fileBuffer = await file.arrayBuffer()
    const fileBlob = new Blob([fileBuffer], { type: file.type })
    const tempFile = new File([fileBlob], file.name, { type: file.type })

    // Get dimensions
    const dimensions = await getImageDimensions(tempFile)

    // Compress
    await compressImage(tempFile)

    // Generate thumbnail
    await generateThumbnail(tempFile)

    // Create metadata
    const url = `/api/images/${pageId}/${file.name}`
    const thumbnailUrl = `/api/images/${pageId}/${file.name}?thumb=true`
    const metadata = formatImageMetadata(file as File, dimensions, url, 'mock-tenant-id', pageId)
    metadata.thumbnailUrl = thumbnailUrl

    // Log audit
    await logAuditEvent({
      userId: 'mock-user-id',
      tenantId: 'mock-tenant-id',
      action: 'image_uploaded',
      entity: 'image',
      entityId: metadata.id,
      metadata: {
        filename: metadata.filename,
        size: metadata.size,
        dimensions: metadata.dimensions,
        pageId,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: metadata,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/images?pageId=...&tenantId=...
 * List images in library
 */
export async function GET(request: NextRequest) {
  try {
    // Auth check placeholder
    // In real implementation, verify session and user authorization

    // Parse query params
    const url = new URL(request.url)
    const pageId = url.searchParams.get('pageId')
    const limit = parseInt(url.searchParams.get('limit') || '100')
    const offset = parseInt(url.searchParams.get('offset') || '0')

    if (!pageId) {
      return NextResponse.json(
        { error: 'Missing pageId' },
        { status: 400 }
      )
    }

    // Mock: Return sample images
    const mockImages = [
      {
        id: 'img_abc123',
        filename: 'image-1.webp',
        originalName: 'product-photo.jpg',
        mimeType: 'image/jpeg',
        size: 245000,
        dimensions: { width: 1200, height: 800, aspectRatio: 1.5 },
        url: '/api/images/img_abc123',
        thumbnailUrl: '/api/images/img_abc123?thumb=true',
        uploadedAt: new Date('2025-11-19'),
        pageId,
        tenantId: 'mock-tenant-id',
      },
    ]

    return NextResponse.json(
      {
        success: true,
        data: {
          images: mockImages.slice(offset, offset + limit),
          pagination: {
            total: mockImages.length,
            limit,
            offset,
          },
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('List error:', error)
    return NextResponse.json(
      { error: 'Failed to list images' },
      { status: 500 }
    )
  }
}
