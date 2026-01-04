import { DocumentTextIcon, ImageIcon } from "@sanity/icons";
import { defineField, defineType, defineArrayMember } from "sanity";

export const bodyText = defineType({
  name: "bodytext",
  type: "object",
  title: "Brødtekst",
  fields: [
    defineField({
      type: "array",
      name: "body",
      title: "Brødtekst",
      description: "Her skriver du inn teksten som skal vises på siden.",
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
});
