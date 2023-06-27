import { BLOCKS, Block, Inline, MARKS } from '@contentful/rich-text-types';
import Image from 'next/image';
import { ReactNode } from 'react';
import dummyImg from '/public/gartnerihagen_solnedgang.jpg';

export const renderRichTextOptions = {
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
    [BLOCKS.EMBEDDED_ASSET]: (node: Block) => {
      const width = node.data.target.fields.file.details.image.width;
      const height = node.data.target.fields.file.details.image.height;
      const url = node.data.target.fields.file.url;
      const description = node.data.target.fields.description;

      console.log(description);

      return (
        <div>
          <Image
            src={`https://${url}`}
            alt={description}
            height={height}
            width={width}
          />
          <p className="rich-image-caption">
            <em>{description}</em>
          </p>
        </div>
      );
    },
  },
};
