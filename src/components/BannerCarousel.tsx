import React, { useEffect, useRef, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext, type CarouselApi } from '@/components/ui/carousel';

type BannerCarouselProps = {
  images?: string[]; // paths relative to the web root, e.g. '/banners/1.jpg'
  className?: string;
  heightClass?: string; // Tailwind height class for responsive sizing
  autoplayMs?: number;
};

/**
 * Simple banner carousel that reads images from the public folder by URL.
 * Place your images under `public/banners/` and pass paths like '/banners/hero-1.jpg'.
 */
export const BannerCarousel: React.FC<BannerCarouselProps> = ({
  images = ['/banner1.jpg', '/banner2.jpg', '/banner3.jpg'],
  className = '',
  heightClass = 'h-56 sm:h-72 md:h-96',
  autoplayMs = 4000,
}) => {
  const [api, setApi] = useState<CarouselApi | undefined>(undefined);
  const timerRef = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!api) return;

    // Only autoplay when there's more than one slide and autoplayMs > 0
    if ((images?.length ?? 0) <= 1 || autoplayMs <= 0) return;

    // start autoplay
    const start = () => {
      if (timerRef.current) return;
      timerRef.current = window.setInterval(() => {
        api.scrollNext();
      }, autoplayMs);
    };

    const stop = () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    if (!paused) start();

    return () => stop();
  }, [api, autoplayMs, paused, images]);

  // track selected slide for indicators
  useEffect(() => {
    if (!api) return;

    const onSelect = () => {
      try {
        const idx = api.selectedScrollSnap();
        setSelected(typeof idx === 'number' ? idx : 0);
      } catch (e) {
        // ignore
      }
    };

    onSelect();
    api.on('select', onSelect);
    api.on('reInit', onSelect);

    return () => {
      api.off('select', onSelect);
      api.off('reInit', onSelect);
    };
  }, [api, images]);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <Carousel setApi={(a) => setApi(a)} opts={{ loop: true }} className="w-full" tabIndex={0}>
        <CarouselContent className={`${heightClass}`}>
          {images.map((src, i) => (
            <CarouselItem key={i}>
              <div className="w-full h-full rounded-lg overflow-hidden bg-muted">
                <img src={src} alt={`banner-${i}`} className="w-full h-full object-cover block" />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Visible arrows placed over the carousel */}
        <CarouselPrevious className="left-4 z-20 bg-background/70" aria-label="Previous banner" />
        <CarouselNext className="right-4 z-20 bg-background/70" aria-label="Next banner" />
      </Carousel>

      {/* Dots / indicators */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {images.map((_, idx) => (
          <button
            key={idx}
            onClick={() => api?.scrollTo(idx)}
            className={`w-3 h-3 rounded-full transition-colors duration-200 ${selected === idx ? 'bg-primary' : 'bg-muted/60'}`}
            aria-current={selected === idx}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default BannerCarousel;
