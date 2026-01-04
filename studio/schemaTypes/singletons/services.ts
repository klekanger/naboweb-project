import { CubeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "frontpage-services",
  type: "document",
  title: "Forside - 'tjenesteboksene' øverst",
  icon: CubeIcon,
  fieldsets: [
    {
      name: "servicebox1",
      title: "Tjenesteboks #1",
    },
    {
      name: "servicebox2",
      title: "Tjenesteboks #2",
    },
    {
      name: "servicebox3",
      title: "Tjenesteboks #3",
    },
  ],
  fields: [
    defineField({
      name: "title1",
      type: "string",
      title: "Tittel på tjenesteboks #1",
      fieldset: "servicebox1",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description1",
      type: "string",
      title: "Tekst i tjenesteboks #1",
      fieldset: "servicebox1",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "icon1",
      type: "myIcon",
      title: "Ikon for tjenesteboks #1",
      fieldset: "servicebox1",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "private1",
      type: "boolean",
      title: "Krever innlogging",
      description:
        "Vil vise et hengelåssymbol for å vise at brukeren må være logget inn for å kunne lese innholdet.",
      fieldset: "servicebox1",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url1",
      type: "string",
      title: "URL klikk på lenke i tjenesteboks #1 skal lede til",
      fieldset: "servicebox1",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "title2",
      type: "string",
      title: "Tittel på tjenesteboks #2",
      fieldset: "servicebox2",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description2",
      type: "string",
      title: "Tekst i tjenesteboks #2",
      fieldset: "servicebox2",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "icon2",
      type: "myIcon",
      title: "Ikon for tjenesteboks #2",
      fieldset: "servicebox2",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "private2",
      type: "boolean",
      title: "Krever innlogging",
      description:
        "Vil vise et hengelåssymbol for å vise at brukeren må være logget inn for å kunne lese innholdet.",
      fieldset: "servicebox2",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url2",
      type: "string",
      title: "URL klikk på lenke i tjenesteboks #2 skal lede til",
      fieldset: "servicebox2",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "title3",
      type: "string",
      title: "Tittel på tjenesteboks #3",
      fieldset: "servicebox3",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description3",
      type: "string",
      title: "Tekst i tjenesteboks #3",
      fieldset: "servicebox3",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "icon3",
      type: "myIcon",
      title: "Ikon for tjenesteboks #3",
      fieldset: "servicebox3",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "private3",
      type: "boolean",
      title: "Krever innlogging",
      description:
        "Vil vise et hengelåssymbol for å vise at brukeren må være logget inn for å kunne lese innholdet.",
      fieldset: "servicebox3",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "url3",
      type: "string",
      title: "URL klikk på lenke i tjenesteboks #3 skal lede til",
      fieldset: "servicebox3",
      validation: (rule) => rule.required(),
    }),
  ],
});
