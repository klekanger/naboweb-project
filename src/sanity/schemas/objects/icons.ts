import { defineType } from "sanity";

export const ICONS = [
  { title: "Bok", value: "BookIcon" },
  { title: "Hus", value: "HouseIcon" },
  { title: "Nyheter", value: "NewsIcon" },
  { title: "Blyant", value: "PencilIcon" },
];

export const iconType = defineType({
  name: "myIcon",
  title: "Icon",
  type: "string",
  options: {
    list: ICONS.map(({ title, value }) => ({ title, value })),
    layout: "radio",
  },
});
