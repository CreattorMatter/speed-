import { CarouselView } from '@/features/digital-carousel/components/CarouselView';

interface CarouselPageProps {
  params: {
    id: string;
  };
}

export default function CarouselPage({ params }: CarouselPageProps) {
  return <CarouselView carouselId={params.id} />;
} 