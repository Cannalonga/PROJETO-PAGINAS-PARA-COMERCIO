/**
 * Static Export Types
 * Type definitions for static build and deployment
 */

export interface PageContent {
  id: string
  title: string
  slug: string
  description: string
  blocks: PageBlock[]
  customCss?: string
  favicon?: string
  logo?: string
  metadata?: Record<string, any>
}

export interface PageBlock {
  id: string
  type: string
  content: Record<string, any>
  settings?: Record<string, any>
}

export interface StaticBuildOptions {
  pageId: string
  tenantId: string
  pageName: string
  baseUrl: string
  includePreview?: boolean
  minifyCss?: boolean
  minifyHtml?: boolean
  version?: string
}

export interface StaticBuildResult {
  success: boolean
  html: string
  preview: string
  preview_html: string
  assets: StaticAsset[]
  sitemap: string
  metadata: BuildMetadata
  error?: string
}

export interface StaticAsset {
  path: string
  content: string | Buffer
  mimeType: string
  size: number
}

export interface BuildMetadata {
  buildDate: Date
  buildTime: number // milliseconds
  pageId: string
  tenantId: string
  version: string
  locale: string
  charset: string
  canonical: string
  seoScore?: number
}

export interface DeploymentConfig {
  provider: 'aws-s3' | 'cloudflare-r2' | 'supabase' | 'local'
  bucket: string
  region?: string
  accessKey?: string
  secretKey?: string
  endpoint?: string
  cacheControl?: string
}

export interface DeploymentStatus {
  deploymentId: string
  status: 'pending' | 'building' | 'deploying' | 'invalidating' | 'success' | 'failed' | 'rolled-back'
  pageId: string
  tenantId: string
  startTime: Date
  endTime?: Date
  duration?: number
  version: string
  publicUrl?: string
  previewUrl?: string
  error?: string
  logs: DeploymentLog[]
}

export interface DeploymentLog {
  timestamp: Date
  level: 'info' | 'warning' | 'error'
  message: string
  details?: Record<string, any>
}

export interface CacheInvalidation {
  provider: string
  paths: string[]
  purgeAll?: boolean
  timestamp: Date
  success: boolean
  error?: string
}

export interface RollbackRequest {
  deploymentId: string
  reason: string
  rollbackToVersion: string
}

export interface RollbackResult {
  success: boolean
  previousVersion: string
  currentVersion: string
  timestamp: Date
  publicUrl: string
}

export interface PagePreview {
  pageId: string
  tenantId: string
  title: string
  description: string
  imageUrl: string
  previewToken: string
  expiresAt: Date
  viewCount: number
}

/**
 * HTML Generation Types
 */
export interface HtmlGenerationOptions {
  title: string
  description: string
  keywords: string[]
  ogImage: string
  canonical: string
  favicon: string
  baseUrl: string
  cssInline?: string
  headExtra?: string
  bodyExtra?: string
}

export interface CriticalCss {
  css: string
  media?: string
  fonts?: string[]
}

/**
 * Build Activity Types
 */
export interface BuildActivity {
  id: string
  deploymentId: string
  pageId: string
  tenantId: string
  type:
    | 'BUILD_START'
    | 'BUILD_SUCCESS'
    | 'BUILD_FAILED'
    | 'DEPLOY_START'
    | 'DEPLOY_SUCCESS'
    | 'DEPLOY_FAILED'
    | 'CACHE_INVALIDATE_START'
    | 'CACHE_INVALIDATE_SUCCESS'
    | 'CACHE_INVALIDATE_FAILED'
    | 'ROLLBACK_START'
    | 'ROLLBACK_SUCCESS'
    | 'ROLLBACK_FAILED'
  timestamp: Date
  details: Record<string, any>
  userId?: string
  ipAddress?: string
}

/**
 * Deployment History
 */
export interface DeploymentRecord {
  id: string
  pageId: string
  tenantId: string
  version: string
  status: 'stable' | 'failed' | 'rolled-back'
  publicUrl: string
  previewUrl: string
  buildDate: Date
  deployDate?: Date
  rollbackDate?: Date
  publishedBy: string
  fileSize: number
  buildTime: number
  deployTime?: number
}
