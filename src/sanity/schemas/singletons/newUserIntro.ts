import { defineField, defineType } from "sanity";
import { UserIcon } from "@sanity/icons";

export default defineType({
  name: "frontpage-new-user-intro",
  type: "document",
  title: "Forside - Informasjon for nye brukere",
  icon: UserIcon,
  fields: [
    defineField({
      name: "enableNewUserIntro",
      type: "boolean",
      title: "Vis intro for nye beboere på forsiden",
    }),
    defineField({
      name: "title",
      type: "string",
      title: "Tittel",
      description: "Hovedtittel for tekst som ønsker nye beboere velkommen.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "introText",
      type: "bodytext",
      title: "Brødtekst",
    }),
  ],
});
