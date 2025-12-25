import { defineField, defineType } from "sanity";
import { UserIcon } from "@sanity/icons";

export default defineType({
  type: "document",
  name: "authors",
  title: "Forfattere",
  icon: UserIcon,
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
      name: "email",
      type: "string",
      title: "E-post",
    }),
    defineField({
      name: "emailSubscription",
      type: "boolean",
      title: "Får oppdateringer på e-post",
      hidden: true,
      deprecated: {
        reason: "Dette lagres nå i Clerk i stedet for i Sanity",
      },

      description:
        "Om personen vil ha oppdatering på e-post når det har kommet nytt innhold eller nye meldinger.",
      initialValue: true,
    }),
    defineField({
      name: "authorImage",
      type: "image",
      title: "Forfatter-bilde",
      hidden: false,
      description: "Portrettbilde av forfatter.",
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
