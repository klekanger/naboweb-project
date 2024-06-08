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
      name: "bodytext",
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
  ],
});
