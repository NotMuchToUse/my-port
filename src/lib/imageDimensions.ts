import { useEffect, useState } from 'react';
import { isSafeUrl } from '@/src/lib/portfolioLogic';
import type { GalleryItem } from '@/src/types/database';

export interface ImageDimensions {
  width: number;
  height: number;
}

/**
 * Measures naturalWidth and naturalHeight of an image URL in the browser.
 * Input: safe image URL string; Output: Promise<ImageDimensions | null>.
 */
export function measureImageDimensions(
  src: string
): Promise<ImageDimensions | null> {
  if (typeof window === 'undefined' || !isSafeUrl(src)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const img = new window.Image();
    let settled = false;

    const finish = (result: ImageDimensions | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
      resolve(result);
    };

    const timer = window.setTimeout(() => finish(null), 8000);
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        finish({ width: img.naturalWidth, height: img.naturalHeight });
      } else {
        finish(null);
      }
    };
    img.onerror = () => finish(null);
    img.src = src;
  });
}

/**
 * Resolves natural image dimensions in the browser for gallery items so MasonryPhotoAlbum
 * renders every photo at its exact aspect ratio without cropping.
 * Input: GalleryItem[]; Output: map of item.id -> ImageDimensions.
 */
export function useResolvedGalleryDimensions(
  items: GalleryItem[]
): Record<string, ImageDimensions> {
  const [measured, setMeasured] = useState<Record<string, ImageDimensions>>({});

  useEffect(() => {
    let active = true;
    const targets = items.filter(
      (item) =>
        isSafeUrl(item.image_url) &&
        !(
          typeof item.width === 'number' &&
          item.width > 0 &&
          typeof item.height === 'number' &&
          item.height > 0
        )
    );

    if (targets.length === 0) return;

    Promise.all(
      targets.map(async (item) => {
        const dims = await measureImageDimensions(item.image_url);
        return { id: item.id, dims };
      })
    ).then((results) => {
      if (!active) return;
      setMeasured((prev) => {
        const next = { ...prev };
        let changed = false;
        for (const { id, dims } of results) {
          if (
            dims &&
            (!next[id] ||
              next[id].width !== dims.width ||
              next[id].height !== dims.height)
          ) {
            next[id] = dims;
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    });

    return () => {
      active = false;
    };
  }, [items]);

  return measured;
}
