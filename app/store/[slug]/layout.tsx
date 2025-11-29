import { Metadata } from 'next';

type Props = {
  params: { slug: string };
};

// Gerar metadata dinâmica para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = params;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    // Fazer fetch para a API ao invés de usar Prisma diretamente
    const response = await fetch(`${baseUrl}/api/public/${slug}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return {
        title: 'Página não encontrada | VitrinaFast',
        description: 'A página que você está procurando não existe.',
      };
    }

    const data = await response.json();
    const title = data.title || 'Vitrine Digital';
    const description = data.pageDescription || `Conheça ${data.storeName} - Produtos e serviços de qualidade.`;
    
    // Pegar primeira foto como imagem do OG
    const photos = data.photos || [];
    const ogImage = photos[0]?.url || '/og-default.png';
    
    const pageUrl = `${baseUrl}/loja/${slug}`;

    return {
      title: `${title} | VitrinaFast`,
      description: description,
      keywords: [data.storeName, data.city, data.state, 'vitrine digital', 'loja online'].filter(Boolean),
      authors: [{ name: data.storeName }],
      creator: 'VitrinaFast',
      publisher: 'VitrinaFast',
      
      // Open Graph (Facebook, WhatsApp, LinkedIn)
      openGraph: {
        type: 'website',
        locale: 'pt_BR',
        url: pageUrl,
        siteName: 'VitrinaFast',
        title: title,
        description: description,
        images: [
          {
            url: ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      
      // Twitter Card
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: [ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`],
      },
      
      // Robots
      robots: {
        index: true,
        follow: true,
      },
      
      // Alternates
      alternates: {
        canonical: pageUrl,
      },
    };
  } catch (error) {
    console.error('Erro ao gerar metadata:', error);
    return {
      title: 'VitrinaFast - Vitrine Digital',
      description: 'Crie sua vitrine digital profissional',
    };
  }
}

export default function LojaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
