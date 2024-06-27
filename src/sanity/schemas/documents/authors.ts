import { defineField, defineType } from "sanity";
import { UserIcon } from "@sanity/icons";

export default defineType({
  type: "document",
  name: "authors",
  title: "Forfattere",
  description:
    'Navn på artikkelforfattere. Kan brukes hvis du ønsker "byline" på artikler.',
  fields: [
    defineField({
      name: "firstName",
      type: "string",
      title: "Fornavn",
      hidden: false,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "lastName",
      type: "string",
      title: "Etternavn",
      hidden: false,
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "authorImage",
      type: "image",
      title: "Forfatter-bilde",
      hidden: false,
      description: "Portrettbilde av forfatter.",
    }),
    defineField({
      type: "boolean",
      description:
        "If this document was archived on Contentful at the time of export, the document will be in a read-only state.",
      name: "contentfulArchived",
      readOnly: true,
    }),
  ],
  preview: {
    select: {
      firstName: "firstName",
      lastName: "lastName",
      authorImage: "authorImage",
    },
    prepare({ firstName, lastName, authorImage }) {
      return {
        title: `${firstName} ${lastName}`,
        media: authorImage || UserIcon,
      };
    },
  },
});
