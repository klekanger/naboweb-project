import type { ContentImage } from '@/types/types';
import type { Asset, EntryFieldTypes } from 'contentful';

/**
 * Utility function to parse a Contentful image asset
 * into a more usable format with only the properties we need.
 *
 * @param asset - The Contentful image asset to parse
 * @returns - A parsed Contentful image asset
 *
 * @example
 * // const parsedImage = parseContentfulImage(image);
 * //
 * // parsedImage = {
 * //   src: 'https://images.ctfassets.net/...',
 * //   description: 'A description of the image',
 * //   width: 1920,
 * //   height: 1080,
 * // }
 *
 */
export function parseContentfulImage(
  asset?: Asset<undefined> | EntryFieldTypes.AssetLink
): ContentImage | undefined {
  if (!asset) {
    return undefined;
  }

  if (!('fields' in asset)) {
    return undefined;
  }

  return {
    src: `https://${asset.fields.file?.url ?? ''}`,
    description: asset.fields.description ?? '',
    width: asset.fields.file?.details.image?.width ?? 0,
    height: asset.fields.file?.details.image?.height ?? 0,
  };
}
