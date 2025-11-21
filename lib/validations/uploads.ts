/**
 * lib/validations/uploads.ts
 * ✅ Zod schemas for upload validation
 */

import { z } from 'zod';

export const uploadFileSchema = z.object({
  // Validated in handler, not schema
});

export const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

export type UploadConfig = {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
};

export const defaultUploadConfig: UploadConfig = {
  maxSizeBytes: MAX_FILE_SIZE_BYTES,
  allowedMimeTypes: ALLOWED_MIME_TYPES,
  allowedExtensions: ALLOWED_EXTENSIONS,
};
