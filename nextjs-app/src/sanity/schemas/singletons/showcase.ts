import { CubeIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "frontpage-showcase",
  type: "document",
  title: "Forside - utvalgte blogginnlegg",
  icon: CubeIcon,
  fields: [
    defineField({
      name: "enableShowcase",
      type: "boolean",
      title: "Vis utvalgte blogginnlegg på forsiden",
    }),
    defineField({
      name: "showcaseTitle",
      type: "string",
      title: "Overskrift",
      validation: (rule) => rule.required(),
    }),

    defineField({
      name: "showcaseBlogposts",
      type: "array",
      title: "Bloggposter som skal fremheves",
      of: [
        defineField({
          name: "showcaseBlogpost",
          type: "reference",

          to: {
            type: "blogPost",
          },
          options: {
            filter: "privatePost == $private",
            filterParams: { private: false },
          },
        }),
      ],
    }),
  ],
});
