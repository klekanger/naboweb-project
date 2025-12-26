import { CubeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "frontpage-hero",
  type: "document",
  title: "Forside - 'intromodul' øverst",
  icon: CubeIcon,
  fieldsets: [
    {
      name: "content",
      title: "Hovedinnhold",
    },
    {
      name: "button",
      title: "Knapp til modulen",
    },
  ],
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Tittel",
      description: "Hovedtittel øverst på siden",
      fieldset: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "subtitle",
      type: "string",
      title: "Undertittel",
      description: "Vises under hovedtittelen. Kan være blank.",
      fieldset: "content",
    }),
    defineField({
      name: "heroImage",
      title: "Bilde til intromodulen ('hero')",
      type: "image",
      fieldset: "content",
      fields: [
        defineField({
          name: "alt",
          type: "string",
          title: "Alt-tekst",
          description:
            "Alternativ tekst til bildet, for tilgjengelighet for blinde og svaksynte.",
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "bodyText",
      type: "text",
      title: "Teksten som skal vises øverst.",
      fieldset: "content",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "showButton",
      type: "boolean",
      title: "Vis knapp",
      description: "Om du ønsker å vise for eksempel en 'les mer'-knapp",
      fieldset: "button",
    }),
    defineField({
      name: "buttonText",
      type: "string",
      title: "Tekst til knapp",
      fieldset: "button",
    }),
    defineField({
      name: "buttonLink",
      type: "reference",
      title: "Side knappen skal lenke til",
      to: { type: "page" },
      fieldset: "button",
    }),
  ],
});
