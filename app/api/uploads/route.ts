/**
 * app/api/uploads/route.ts
 * ✅ POST /api/uploads - Upload file (image only, secure)
 * ✅ Rate limiting: 10 uploads per hour per tenant
 */

import { NextResponse } from 'next/server';
import { withAuthHandler } from '@/lib/auth/with-auth-handler';
import { errorResponse, successResponse } from '@/utils/helpers';
import { randomUUID } from 'crypto';
import { defaultUploadConfig } from '@/lib/validations/uploads';
import { enforceRateLimitProfile } from '@/lib/rate-limit-helpers';

/**
 * Stub: uploadToS3 - Replace with your actual S3 implementation
 * This is a placeholder. Implement with AWS SDK or similar.
 */
async function uploadToS3(config: {
  key: string;
  contentType: string;
  body: Buffer;
}): Promise<string> {
  // TODO: Implement actual S3 upload using AWS SDK or Upstash
  // For now, return a mock URL
  console.log(`[UPLOAD] Mock upload: ${config.key}`);
  return `https://cdn.example.com/${config.key}`;
}

/**
 * POST /api/uploads
 * ✅ SECURITY: Requires authentication
 * ✅ Validates file type and size
 * ✅ Generates random filename (prevents path traversal)
 * ✅ Stores file in tenant-specific directory
 * ✅ Rate limiting: 10 uploads per hour per tenant
 */
export const POST = withAuthHandler(
  async ({ tenant, req }) => {
    try {
      // ✅ SECURITY: Rate limiting (10 uploads per hour per tenant)
      const rateLimitKey = `uploads:${tenant.id}`;
      const rateLimited = await enforceRateLimitProfile(req, rateLimitKey, 'upload');
      if (rateLimited) return rateLimited;

      const formData = await req.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json(
          errorResponse('Arquivo é obrigatório'),
          { status: 400 }
        );
      }

      // ✅ SECURITY: Validate MIME type
      if (!defaultUploadConfig.allowedMimeTypes.includes(file.type)) {
        return NextResponse.json(
          errorResponse(
            `Tipo de arquivo não permitido. Aceitos: ${defaultUploadConfig.allowedMimeTypes.join(', ')}`
          ),
          { status: 415 }
        );
      }

      // ✅ SECURITY: Validate file size
      if (file.size > defaultUploadConfig.maxSizeBytes) {
        return NextResponse.json(
          errorResponse(
            `Arquivo muito grande. Máximo: ${defaultUploadConfig.maxSizeBytes / 1024 / 1024}MB`
          ),
          { status: 413 }
        );
      }

      // ✅ SECURITY: Generate random filename (prevent path traversal attacks)
      const randomFilename = `${randomUUID()}`;
      const extension = file.name.split('.').pop() || 'jpg';
      const finalFilename = `${randomFilename}.${extension}`;

      // ✅ SECURITY: Store in tenant-specific directory
      const key = `tenants/${tenant.id}/images/${finalFilename}`;

      // Convert File to Buffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to S3 (or your configured storage)
      const url = await uploadToS3({
        key,
        contentType: file.type,
        body: buffer,
      });

      return NextResponse.json(
        successResponse(
          {
            url,
            key,
            filename: file.name,
            size: file.size,
            mimeType: file.type,
          },
          'Arquivo enviado com sucesso'
        ),
        { status: 201 }
      );
    } catch (error) {
      console.error('[POST /api/uploads] Error:', error);

      return NextResponse.json(
        errorResponse('Erro ao fazer upload do arquivo'),
        { status: 500 }
      );
    }
  },
  { requireTenant: true }
);
