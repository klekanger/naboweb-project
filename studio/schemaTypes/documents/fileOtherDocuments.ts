import { FolderIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "fileOtherDocuments",
  type: "document",
  title: "Diverse dokumenter",
  icon: FolderIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Tittel for dokumentet",
      description: "Vises under hovedtittelen.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Kort beskrivelse av dokumentet",
      description:
        "Beskriv kort hva filen inneholder, slik at det blir lettere å søke opp informasjon senere.",
    }),
    defineField({
      name: "otherDocument",
      type: "file",
      title: "Fil/dokument",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "tags",
      type: "array",
      title: "Tagger",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
  ],
});
