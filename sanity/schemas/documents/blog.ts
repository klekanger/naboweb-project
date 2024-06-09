import { defineArrayMember, defineField, defineType } from "sanity";
import { DocumentIcon, ImageIcon } from "@sanity/icons";

export default defineType({
  type: "document",
  name: "blogPost",
  title: "Blogginnlegg/artikkel",
  fields: [
    defineField({
      name: "privatePost",
      type: "boolean",
      title: "Privat for beboere",
      hidden: false,
      description:
        "Kryss av hvis innlegget kun skal være synlig for innloggede brukere.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Tittel",
      hidden: false,
      description: "Tittel på blogginnlegget.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      type: "array",
      of: [{ type: "block" }, { type: "image" }],
      title: "Oppsummering",
      hidden: false,
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "featuredImage",
      type: "image",
      title: "Toppbilde",
      hidden: false,
      description: "Hovedbilde som skal vises over artikkelen.",
    }),
    defineField({
      name: "bodyText",
      type: "array",
      of: [
        // Paragraphs
        defineArrayMember({
          type: "block",

          marks: {
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Lenke",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "Url",
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ["http", "https", "mailto", "tel"],
                        allowRelative: true,
                      }),
                  },
                ],
              },
            ],
          },
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2 - Ekstra stor", value: "h2" },
            { title: "H3 - Stor", value: "h3" },
            { title: "H4 - Middels", value: "h4" },
            { title: "Sitat", value: "blockquote" },
          ],
          lists: [
            { title: "Punktliste", value: "bullet" },
            { title: "Nummerert liste", value: "number" },
          ],
        }),
        // Custom blocks

        defineField({
          type: "image",
          icon: ImageIcon,
          name: "image",
          title: "Bilde",
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              title: "Bildetekst",
              name: "caption",
              type: "string",
            }),
            defineField({
              name: "alt",
              type: "string",
              title: "Alt-tekst",
              description:
                "Alternativ tekst til bildet, for tilgjengelighet for blinde og svaksynte.",
            }),
          ],
        }),
        defineField({
          type: "youtube",
          name: "YouTube",
          description: "Sett inn YouTube-video.",
        }),
        defineField({
          type: "twitter",
          name: "Twitter",
          description: "Sett inn Twitter-tweet.",
        }),
      ],
      title: "Brødtekst",
      hidden: false,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      type: "array",
      of: [{ type: "reference", to: [{ type: "authors" }] }],
      title: "Forfatter",
      hidden: false,
    }),
    defineField({
      name: "slug",
      type: "slug",
      title: "Slug",
      hidden: false,
      description:
        "Dette er den siste delen av URL-en som gir bloggposten en unik adresse. Genereres automagisk!",
      validation: (Rule) => Rule.required(),
      options: { source: "title" },
    }),
    defineField({
      type: "boolean",
      description:
        "If this document was archived on Contentful at the time of export, the document will be in a read-only state.",
      name: "contentfulArchived",
      readOnly: true,
    }),
  ],
  preview: { select: { title: "title" } },
  readOnly: ({ document }) =>
    (document == null ? void 0 : document.contentfulArchived) === !0,
});


/* 
export default defineType({
  type: "document",
  name: "blog",
  title: "Blogg-artikler",
  icon: DocumentIcon,
  fields: [
    defineField({
      type: "string",
      name: "title",
      title: "Tittel",
      validation: (rule) => rule.required(),
    }),
    defineField({
      type: "slug",
      name: "slug",
      title: "Slug",
      options: {
        source: "title",
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "requiresLogin",
      type: "boolean",
      title: "Privat for beboere (krever innlogging)",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "overview",
      description:
        "Brukes som ingress og for <meta>-beskrivelses-tagen for SEO.",
      title: "Ingress",
      type: "array",
      of: [
        // Paragraphs
        defineArrayMember({
          lists: [],
          marks: {
            annotations: [],
            decorators: [
              {
                title: "Kursiv",
                value: "em",
              },
              {
                title: "Fet skrift",
                value: "strong",
              },
            ],
          },
          styles: [],
          type: "block",
        }),
      ],
      validation: (rule) => rule.max(155).required(),
    }),
    defineField({
      type: "image",
      name: "mainImage",
      title: "Hovedbilde",
      description: "Bildet som vises øverst på siden.",
      options: {
        hotspot: true,
      },
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt-tekst",
          description:
            "Alternativ tekst til bildet, for tilgjengelighet for blinde og svaksynte.",
        }),
      ],
    }),
    defineField({
      type: "array",
      name: "body",
      title: "Brødtekst",
      description:
        "Her skriver du inn hovedteksten som skal vises i artikkelen.",
      of: [
        // Paragraphs
        defineArrayMember({
          type: "block",

          marks: {
            annotations: [
              {
                name: "link",
                type: "object",
                title: "Lenke",
                fields: [
                  {
                    name: "href",
                    type: "url",
                    title: "Url",
                    validation: (Rule) =>
                      Rule.uri({
                        scheme: ["http", "https", "mailto", "tel"],
                        allowRelative: true,
                      }),
                  },
                ],
              },
            ],
          },
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2 - Ekstra stor", value: "h2" },
            { title: "H3 - Stor", value: "h3" },
            { title: "H4 - Middels", value: "h4" },
            { title: "Sitat", value: "blockquote" },
          ],

          lists: [
            { title: "Punktliste", value: "bullet" },
            { title: "Nummerert liste", value: "number" },
          ],
        }),
        // Custom blocks

        defineField({
          type: "image",
          icon: ImageIcon,
          name: "image",
          title: "Bilde",
          options: {
            hotspot: true,
          },
          fields: [
            defineField({
              title: "Bildetekst",
              name: "caption",
              type: "string",
            }),
            defineField({
              name: "alt",
              type: "string",
              title: "Alt-tekst",
              description:
                "Alternativ tekst til bildet, for tilgjengelighet for blinde og svaksynte.",
            }),
          ],
        }),
        defineField({
          type: "youtube",
          name: "YouTube",
          description: "Sett inn YouTube-video.",
        }),
        defineField({
          type: "twitter",
          name: "Twitter",
          description: "Sett inn Twitter-tweet.",
        }),
      ],
    }),
  ],
  preview: {
    select: {
      title: "title",
    },
    prepare({ title }) {
      return {
        subtitle: "Artikkel",
        title,
      };
    },
  },
});
 */