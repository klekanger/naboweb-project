import { FolderIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "fileMeetingMinutes",
  type: "document",
  title: "Dokumenter fra årsmøter",
  icon: FolderIcon,
  fields: [
    defineField({
      name: "title",
      type: "string",
      title: "Tittel for møtet",
      description: "Vises under hovedtittelen.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      type: "text",
      title: "Kort oppsummering av møtet",
      description:
        "Beskriv kort hva møtet handlet om slik at det blir lettere å søke opp informasjon senere.",
    }),
    defineField({
      name: "meetingDocuments",
      type: "array",
      title: "Filer tilhørende møtet",
      of: [
        {
          type: "file",
          title: "Fil/dokument",
          validation: (rule) => rule.required(),
        },
      ],
    }),

    defineField({
      name: "meetingDate",
      type: "date",
      title: "Møtedato",
      options: {
        dateFormat: "D.M.YYYY",
      },
    }),
    defineField({
      name: "meetingPlace",
      type: "string",
      title: "Sted møtet ble avholdt",
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
