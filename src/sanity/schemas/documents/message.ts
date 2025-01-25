import { CommentIcon } from "@sanity/icons";
import { defineArrayMember, defineField, defineType } from "sanity";

export const message = defineType({
  name: "message",
  type: "document",
  title: "Innlegg på oppslagstavlen",
  icon: CommentIcon,
  fields: [
    defineField({
      name: "title",
      title: "Tittel",
      type: "string",
      description: "Overskrift på meldingen.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "author",
      title: "Forfatter",
      type: "reference",
      to: [{ type: "authors" }],
    }),
    defineField({
      name: "fromAdmin",
      type: "boolean",
      title: "Meldingen er fra styret",
      description: "Kryss av hvis meldingen er fra styret til beboerne",
      initialValue: false,
      options: {
        layout: "checkbox",
      },
    }),
    defineField({
      name: "bodyText",
      title: "Hovedtekst",
      description: "Tekst til innlegget",
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
            { title: "Mellomtittel", value: "h2" },
          ],
        }),
      ],

      hidden: false,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "messageImage",
      type: "image",
      title: "Valgfritt bilde",
      hidden: false,
      description:
        "Her kan du laste opp et bilde eller illustrasjon til meldingen.",
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
      name: "tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "comments",
      type: "array",
      title: "Kommentarer",
      of: [
        defineArrayMember({
          name: "comment",
          type: "object",
          fields: [
            { type: "string", name: "commentTitle" },
            { type: "text", name: "commentText" },
            {
              type: "reference",
              name: "commentAuthor",
              to: [{ type: "authors" }],
            },
            {
              type: "datetime",
              name: "published",
              hidden: true,
            },
            defineField({
              name: "replies",
              type: "array",
              title: "Svar",
              of: [
                defineArrayMember({
                  name: "reply",
                  type: "object",
                  fields: [
                    { type: "text", name: "replyText" },
                    {
                      type: "reference",
                      name: "replyAuthor",
                      to: [{ type: "authors" }],
                    },
                    {
                      type: "datetime",
                      name: "published",
                      hidden: true,
                    },
                  ],
                  initialValue: () => ({
                    published: new Date().toISOString(),
                  }),
                }),
              ],
            }),
          ],
          initialValue: () => ({
            published: new Date().toISOString(),
          }),
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "title" /* , messageImage: "messageImage" */ },
    prepare({ title /* , messageImage  */ }) {
      return {
        title,
        /* media: messageImage, */
      };
    },
  },
});
