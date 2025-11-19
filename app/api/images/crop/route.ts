import { NextRequest, NextResponse } from 'next/server'
import { cropImage, ImageCropData } from '@/lib/image-handler'
import { logAuditEvent } from '@/lib/audit'

/**
 * POST /api/images/crop
 * Crop image based on crop data
 */
export async function POST(request: NextRequest) {
  try {
    // Auth check
    // const session = await getServerSession(authOptions)
    // if (!session?.user?.email) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

    const body = await request.json()
    const { file, cropData, pageId } = body

    if (!file || !cropData || !pageId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Convert base64 or file to Blob
    let fileBlob: Blob
    if (typeof file === 'string') {
      const base64Data = file.split(',')[1] || file
      const binaryString = atob(base64Data)
      const bytes = new Uint8Array(binaryString.length)
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i)
      }
      fileBlob = new Blob([bytes], { type: 'image/webp' })
    } else {
      fileBlob = new Blob([file], { type: 'image/webp' })
    }

    // Create File object
    const croppedFile = new File(
      [fileBlob],
      `cropped-${Date.now()}.webp`,
      { type: 'image/webp' }
    )

    // Perform crop
    const croppedBlob = await cropImage(croppedFile, cropData as ImageCropData)

    // Convert to base64 for response
    const reader = new FileReader()
    const base64Promise = new Promise<string>((resolve) => {
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.readAsDataURL(croppedBlob)
    })

    const croppedBase64 = await base64Promise

    // Log audit
    await logAuditEvent({
      userId: 'mock-user-id',
      tenantId: 'mock-tenant-id',
      action: 'image_cropped',
      entity: 'image',
      entityId: `crop_${Date.now()}`,
      metadata: {
        pageId,
        cropData,
        originalSize: croppedFile.size,
        croppedSize: croppedBlob.size,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: {
          base64: croppedBase64,
          size: croppedBlob.size,
          cropData,
        },
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Crop error:', error)
    return NextResponse.json(
      { error: 'Crop failed' },
      { status: 500 }
    )
  }
}
