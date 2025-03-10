import { CarouselView } from '@/components/DigitalCarousel/CarouselView';

interface CarouselPageProps {
  params: {
    id: string;
  };
}

export default function CarouselPage({ params }: CarouselPageProps) {
  return <CarouselView carouselId={params.id} />;
} 