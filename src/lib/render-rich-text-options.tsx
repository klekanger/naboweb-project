import type { EmbeddedAsset } from '@/types/types';
import { BLOCKS, MARKS, type Block } from '@contentful/rich-text-types';
import Image from 'next/image';
import { type ReactNode } from 'react';

export const renderRichTextOptions = (links?: any) => {
  const assetBlockMap = new Map();
  // Check if links exists, if not that means that we're on a static page where rich text
  // are on a "raw" field. If links exists we should use our custom ResponsiveImage compoent for
  // rendering images instead of GatsbyImage
  if (links) {
    // loop through the assets and add them to the map
    for (const asset of links.assets.block) {
      assetBlockMap.set(asset.sys.id, asset);
    }
  }

  return {
    renderMark: {
      [MARKS.BOLD]: (text: ReactNode) => <strong>{text}</strong>,

      [MARKS.UNDERLINE]: (text: ReactNode) => <u>{text}</u>,
      [MARKS.ITALIC]: (text: ReactNode) => <em>{text}</em>,
    },
    renderNode: {
      [BLOCKS.PARAGRAPH]: (node: Block, children: ReactNode) => (
        <p className="rich-p">{children}</p>
      ),
      [BLOCKS.HEADING_1]: (node: Block, children: ReactNode) => (
        <h1 className="rich-h1">{children}</h1>
      ),
      [BLOCKS.HEADING_2]: (node: Block, children: ReactNode) => (
        <h2 className="rich-h2">{children}</h2>
      ),
      [BLOCKS.HEADING_3]: (node: Block, children: ReactNode) => (
        <h3 className="rich-h3">{children}</h3>
      ),
      [BLOCKS.HEADING_4]: (node: Block, children: ReactNode) => (
        <h4 className="rich-h4">{children}</h4>
      ),
      [BLOCKS.HEADING_5]: (node: Block, children: ReactNode) => (
        <h5 className="rich-h5">{children}</h5>
      ),
      [BLOCKS.HEADING_6]: (node: Block, children: ReactNode) => (
        <h6 className="rich-h6">{children}</h6>
      ),
      [BLOCKS.UL_LIST]: (node: Block, children: ReactNode) => (
        <ul className="rich-ul">{children}</ul>
      ),
      [BLOCKS.OL_LIST]: (node: Block, children: ReactNode) => (
        <ol className="rich-ol">{children}</ol>
      ),
      [BLOCKS.LIST_ITEM]: (node: Block, children: ReactNode) => (
        <li>{children}</li>
      ),
      // eslint-disable-next-line object-shorthand
      [BLOCKS.EMBEDDED_ASSET]: (node: Block) => {
        const asset = assetBlockMap.get(node.data.target.sys.id);
        if (!asset) return null;

        const { width, height } = asset;
        const url = asset.url;
        if (!width || !height || !url) return null;

        const description = asset.description;
        const blurDataURL = asset.url + '?w=10&h=10&fit=fill' || '';

        return (
          <>
            <Image
              src={`${url}`}
              alt={description}
              height={height}
              width={width}
              sizes="100vw"
              blurDataURL={blurDataURL}
              placeholder="blur"
              className="rich-image"
            />
            <p className="rich-image-caption">
              <em>{description}</em>
            </p>
          </>
        );
      },
    },
  };
};
