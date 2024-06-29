import { ThLargeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "documentMenu",
  type: "document",
  title: "Dokumentmeny",
  description:
    "Her kan du velge hvilke dokumenter knappene på siden 'for beboere' skal peke til.",
  icon: ThLargeIcon,
  fieldsets: [
    {
      name: "button1",
      title: "Knapp 1",
      description: "Definer tekst for knapp 1 og filen knappen skal lenke til.",
    },
    {
      name: "button2",
      title: "Knapp 2",
      description: "Definer tekst for knapp 2 og filen knappen skal lenke til.",
    },
    {
      name: "button3",
      title: "Knapp 3",
      description: "Definer tekst for knapp 3 og filen knappen skal lenke til.",
    },
    {
      name: "button4",
      title: "Knapp 4",
      description: "Definer tekst for knapp 4 og filen knappen skal lenke til.",
    },
  ],
  fields: [
    defineField({
      name: "button1Text",
      type: "string",
      title: "Tekst til knapp",
      fieldset: "button1",
      validation: (rule) =>
        rule.required().min(4).max(25).error("Må være mellom 4 og 25 tegn"),
    }),
    defineField({
      name: "button1File",
      type: "reference",
      title: "Filen knappen skal lenke til",
      description:
        "Filen du vil lenke til må være lastet opp under 'diverse dokumenter'",
      to: [{ type: "fileOtherDocuments" }],
      fieldset: "button1",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "button2Text",
      type: "string",
      title: "Tekst til knappen",
      fieldset: "button2",
      validation: (rule) =>
        rule.required().min(4).max(25).error("Må være mellom 4 og 25 tegn"),
    }),
    defineField({
      name: "button2File",
      type: "reference",
      title: "Filen knappen skal lenke til",
      description:
        "Filen du vil lenke til må være lastet opp under 'diverse dokumenter'",
      to: [{ type: "fileOtherDocuments" }],
      fieldset: "button2",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "button3Text",
      type: "string",
      title: "Tekst til knappen",
      fieldset: "button3",
      validation: (rule) =>
        rule.required().min(4).max(25).error("Må være mellom 4 og 25 tegn"),
    }),
    defineField({
      name: "button3File",
      type: "reference",
      title: "Filen knappen skal lenke til",
      description:
        "Filen du vil lenke til må være lastet opp under 'diverse dokumenter'",
      to: [{ type: "fileOtherDocuments" }],
      fieldset: "button3",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "button4Text",
      type: "string",
      title: "Tekst til knappen",
      fieldset: "button4",
      validation: (rule) =>
        rule.required().min(4).max(25).error("Må være mellom 4 og 25 tegn"),
    }),
    defineField({
      name: "button4File",
      type: "reference",
      title: "Filen knappen skal lenke til",
      description:
        "Filen du vil lenke til må være lastet opp under 'diverse dokumenter'",
      to: [{ type: "fileOtherDocuments" }],
      fieldset: "button4",
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Konfigurer snarveiknapper (knapp 1-4) for dokumentmenyen",
      };
    },
  },
});
