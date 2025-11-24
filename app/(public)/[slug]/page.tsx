import PublicPageRenderer from '@/components/PublicPageRenderer';
import { notFound } from 'next/navigation';

// Mock: em produção, buscar do banco de dados
async function getPageData(_slug: string) {
  // TODO: Buscar dados do banco de dados baseado no slug
  // Por enquanto, retorna um mock
  
  return {
    title: 'Meu Negócio',
    pageDescription: 'Bem-vindo à nossa vitrine digital!',
    photos: [
      {
        slot: 'hero',
        url: '/uploads/sample-1.jpg',
        header: 'Destaque Principal',
        description: 'Nossa melhor oferta',
      },
      {
        slot: 'left-top',
        url: '/uploads/sample-2.jpg',
        header: 'Promoção',
        description: 'Aproveite!',
      },
    ],
  };
}

export default async function PublicPage({
  params,
}: {
  params: { slug: string };
}) {
  const pageData = await getPageData(params.slug);

  if (!pageData) {
    notFound();
  }

  return (
    <PublicPageRenderer
      data={{
        title: pageData.title,
        pageDescription: pageData.pageDescription,
        photos: pageData.photos,
      }}
    />
  );
}
