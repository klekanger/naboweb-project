import ImageBox from "@/app/components/shared/ImageBox";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import {
  type SanityImageSource,
  getImageDimensions,
  SanityImageAsset,
} from "@sanity/asset-utils";

import { Tweet } from "react-tweet";
import type { Image } from "sanity";

import YouTubePlayer from "./YouTubePlayer";

export function PreviewPortableText({
  paragraphClasses,
  value,
}: {
  paragraphClasses?: string;
  value: any;
}) {
  const components: PortableTextComponents = {
    block: {
      normal: ({ children }) => {
        return <p className={paragraphClasses}>{children}</p>;
      },
      h2: ({ children }) => {
        return (
          <p className={`${paragraphClasses} font-semibold pt-2 text-lg`}>
            {children}
          </p>
        );
      },
    },
    marks: {
      link: ({ children, value }) => {
        return (
          <a
            className="underline transition hover:opacity-50"
            href={value?.href}
            rel="noreferrer noopener"
          >
            {children}
          </a>
        );
      },
    },

    listItem: {
      // Ex. 1: customizing common list types
      bullet: ({ children }) => {
        return <li>{children}</li>;
      },
      number: ({ children }) => {
        return <li>{children}</li>;
      },
    },

    types: {
      undefined: ({ value }) => {
        return <div>{value}</div>;
      },
    },
  };

  return <PortableText components={components} value={value} />;
}
