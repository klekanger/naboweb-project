import { defineType } from "sanity";
import IconRadioInput from "./IconRadioInput";
import { ICON_OPTIONS } from "./iconOptions";

export const iconType = defineType({
  name: "myIcon",
  title: "Icon",
  type: "string",
  options: {
    list: ICON_OPTIONS.map(({ title, value }) => ({ title, value })),
    layout: "radio",
  },
  components: {
    input: IconRadioInput,
  },
});
