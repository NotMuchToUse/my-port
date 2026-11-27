import { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Images,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { MasonryPhotoAlbum } from 'react-photo-album';
import 'react-photo-album/masonry.css';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import { DICTIONARY } from '@/src/lib/i18n';
import { useResolvedGalleryDimensions } from '@/src/lib/imageDimensions';
import { buildAlbumPhotos } from '@/src/lib/portfolioLogic';
import type { GalleryItem, SiteLanguage } from '@/src/types/database';

interface GallerySectionProps {
  items: GalleryItem[];
  language: SiteLanguage;
}

export function GallerySection({ items, language }: GallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);
  const t = DICTIONARY[language].gallery;
  const measuredDimensions = useResolvedGalleryDimensions(items);

  const albumPhotos = useMemo(
    () => buildAlbumPhotos(items, measuredDimensions),
    [items, measuredDimensions]
  );

  const slides = useMemo(
    () =>
      albumPhotos.map((photo) => ({
        src: photo.src,
        alt: photo.alt,
        width: photo.width,
        height: photo.height,
      })),
    [albumPhotos]
  );

  return (
    <section
      id="gallery"
      className="border-b border-zinc-200/80 bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-[#09090B] sm:text-3xl text-balance">
            {t.heading}
          </h2>
        </div>

        {albumPhotos.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/70 px-6 py-14 text-center">
            <Images className="h-8 w-8 text-zinc-400" aria-hidden="true" />
            <p className="mt-3 text-sm font-medium text-zinc-700">{t.empty}</p>
          </div>
        ) : (
          <MasonryPhotoAlbum
            photos={albumPhotos}
            spacing={12}
            columns={(containerWidth) => {
              if (containerWidth < 640) return 1;
              if (containerWidth < 1024) return 2;
              if (containerWidth < 1280) return 3;
              return 4;
            }}
            onClick={({ index }) => setLightboxIndex(index)}
            componentsProps={{
              button: {
                className:
                  'group block w-full overflow-hidden rounded-xl bg-zinc-100 p-0 ring-2 ring-orange-500/0 transition-all duration-300 hover:ring-orange-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500',
              },
              image: {
                loading: 'lazy',
                referrerPolicy: 'no-referrer',
                className:
                  'block h-auto w-full transition-transform duration-300 group-hover:scale-[1.02]',
              },
            }}
          />
        )}
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
        plugins={[Zoom]}
        render={{
          iconPrev: () => <ChevronLeft className="h-6 w-6" aria-hidden="true" />,
          iconNext: () => <ChevronRight className="h-6 w-6" aria-hidden="true" />,
          iconClose: () => <X className="h-5 w-5" aria-hidden="true" />,
          iconZoomIn: () => <ZoomIn className="h-5 w-5" aria-hidden="true" />,
          iconZoomOut: () => <ZoomOut className="h-5 w-5" aria-hidden="true" />,
        }}
      />
    </section>
  );
}
