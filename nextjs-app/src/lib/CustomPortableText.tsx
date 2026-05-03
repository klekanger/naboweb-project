import ImageBox from "@/components/shared/ImageBox";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import { getImageDimensions, SanityImageAsset } from "@sanity/asset-utils";

import { Tweet } from "react-tweet";

import YouTubePlayer from "./YouTubePlayer";

export function CustomPortableText({
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
        return <h2 className="lg:pr-64">{children}</h2>;
      },
      h3: ({ children }) => {
        return <h3 className="lg:pr-64">{children}</h3>;
      },
      h4: ({ children }) => {
        return <h4 className="lg:pr-64">{children}</h4>;
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
      code: ({ children }) => {
        return (
          <code
            style={{
              backgroundColor: "#48007e",
              paddingLeft: "0.125rem",
              paddingRight: "0.125rem",
              borderRadius: "0.2rem",
              fontFamily: "monospace",
            }}
          >
            {children}
          </code>
        );
      },
    },
    list: {
      checkmark: ({ children }) => {
        return <ul className="list-none pb-6 pl-0">{children}</ul>;
      },
      number: ({ children }) => <ol>{children}</ol>,
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
      Twitter: ({ value }) => {
        if (!value?.tweetId) {
          return null;
        }
        return <Tweet id={value.tweetId} />;
      },

      image: ({
        value,
      }: {
        value: SanityImageAsset & {
          alt?: string;
          caption?: string;
          lqip?: string;
        };
      }) => {
        const dimensions = getImageDimensions(value);

        return (
          <div className="not-prose">
            <ImageBox
              image={value}
              alt={value.alt}
              caption={value?.caption}
              width={dimensions.width}
              height={dimensions.height}
            />
          </div>
        );
      },

      YouTube: ({ value }) => {
        const { url } = value;
        return (
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              paddingTop: 25,
              height: 0,
            }}
          >
            <YouTubePlayer url={url} />
          </div>
        );
      },

      // Keep this type for legacy reasons.
      youtube: ({ value }) => {
        const { url } = value;
        return (
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              paddingTop: 25,
              height: 0,
            }}
          >
            <YouTubePlayer url={url} />
          </div>
        );
      },

      undefined: ({ value }) => {
        return <div>{value}</div>;
      },
    },
  };

  return <PortableText components={components} value={value} />;
}
