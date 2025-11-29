import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';

export const maxDuration = 60;

// ============================================================
// 🔐 SEGURANÇA: Rate limiting por IP
// ============================================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 15; // uploads por janela
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minuto

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_LIMIT_WINDOW };
  }

  if (entry.count >= RATE_LIMIT) {
    return { allowed: false, remaining: 0, resetIn: entry.resetTime - now };
  }

  entry.count++;
  return { allowed: true, remaining: RATE_LIMIT - entry.count, resetIn: entry.resetTime - now };
}

// ============================================================
// 🔐 SEGURANÇA: Validação de magic bytes (tipo real do arquivo)
// ============================================================

const VALID_IMAGE_SIGNATURES: { [key: string]: string[] } = {
  'ffd8ff': ['image/jpeg'],           // JPEG
  '89504e47': ['image/png'],          // PNG
  '47494638': ['image/gif'],          // GIF
  '52494646': ['image/webp'],         // WEBP (RIFF header)
  '424d': ['image/bmp'],              // BMP
  '49492a00': ['image/tiff'],         // TIFF (little-endian)
  '4d4d002a': ['image/tiff'],         // TIFF (big-endian)
  '00000020': ['image/heic', 'image/heif'], // HEIC/HEIF (ftyp box)
  '0000001c': ['image/heic', 'image/heif'], // HEIC/HEIF variant
};

function validateImageMagicBytes(buffer: Buffer): boolean {
  const hex = buffer.slice(0, 8).toString('hex');
  
  for (const signature of Object.keys(VALID_IMAGE_SIGNATURES)) {
    if (hex.startsWith(signature)) {
      return true;
    }
  }
  
  // Aceitar também se o cropper já converteu para JPEG (começa com ffd8)
  if (hex.startsWith('ffd8')) return true;
  
  return false;
}

// ============================================================
// Upload handler
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // 🔐 Rate limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown';
    
    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Muitos uploads. Aguarde um momento.',
          retryAfter: Math.ceil(rateLimit.resetIn / 1000),
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimit.resetIn / 1000).toString(),
            'X-RateLimit-Remaining': '0',
          }
        }
      );
    }

    // 🔐 Validação básica de origem
    const origin = request.headers.get('origin');
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.NEXTAUTH_URL,
      'http://localhost:3000',
      'http://localhost:3001',
    ].filter(Boolean);
    
    if (origin && !allowedOrigins.includes(origin) && process.env.NODE_ENV === 'production') {
      console.warn(`[SECURITY] Upload de origem não permitida: ${origin}`);
      return NextResponse.json(
        { error: 'Origem não permitida' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const slot = formData.get('slot') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo foi fornecido' },
        { status: 400 }
      );
    }

    if (!slot) {
      return NextResponse.json(
        { error: 'Slot não especificado' },
        { status: 400 }
      );
    }

    // Validar tipo de arquivo (Content-Type declarado)
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Apenas imagens são permitidas' },
        { status: 400 }
      );
    }

    // Validar tamanho (máx 5MB por imagem)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Imagem muito grande (máximo 5MB)' },
        { status: 400 }
      );
    }

    // Converter para buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 🔐 Validar magic bytes (tipo real do arquivo)
    if (!validateImageMagicBytes(buffer)) {
      console.warn(`[SECURITY] Upload com magic bytes inválidos de ${ip}`);
      return NextResponse.json(
        { error: 'Arquivo inválido. Apenas imagens JPEG, PNG, GIF e WebP são aceitas.' },
        { status: 400 }
      );
    }

    // Upload para Cloudinary (nuvem)
    const result = await uploadImage(buffer, 'vitrinafast/stores');

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      slot: slot,
      size: file.size,
      width: result.width,
      height: result.height,
      message: `Imagem carregada com sucesso no slot "${slot}"`,
    }, {
      headers: {
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      }
    });
  } catch (error) {
    console.error('[UPLOAD] Erro:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Erro ao fazer upload da imagem. Tente novamente.' },
      { status: 500 }
    );
  }
}
