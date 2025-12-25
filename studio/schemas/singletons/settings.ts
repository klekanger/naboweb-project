import { CogIcon, HomeIcon, MenuIcon } from "@sanity/icons";
import { defineField, defineType } from "sanity";

export default defineType({
  name: "settings",
  title: "Innstillinger",
  type: "document",
  icon: CogIcon,
  groups: [
    {
      name: "company",
      title: "Informasjon om sameiet/borettslaget",
      default: true,
      icon: HomeIcon,
    },
    {
      name: "meta",
      title: "Metadata for SEO",
      icon: CogIcon,
    },
    {
      name: "navbar",
      title: "Toppmeny",
      icon: MenuIcon,
    },
  ],

  fieldsets: [
    {
      name: "menuItem1",
      title: "Menyelement 1",
      options: { collapsible: true, collapsed: false },
    },
    {
      name: "menuItem2",
      title: "Menyelement 2",
      options: { collapsible: true, collapsed: false },
    },
  ],

  // Uncomment below to have edits publish automatically as you type
  // liveEdit: true,
  fields: [
    // Company info
    defineField({
      name: "companyName",
      title: "Navn på sameie/borettslag",
      description: "Brukes blant annet i kontaktinformasjon",
      type: "string",
      group: "company",
    }),
    defineField({
      name: "addressLine1",
      title: "Adresselinje 1",
      description: "Adressen som skal brukes blant annet i kontaktinformasjon",
      type: "string",
      group: "company",
    }),
    defineField({
      name: "addressLine2",
      title: "Adresselinje 2",
      type: "string",
      group: "company",
    }),
    defineField({
      name: "companyDescription",
      title: "Kort beskrivelse av sameiet",
      description: "Kort og 'selgende' beskrivelse av sameiet/borettslaget.",
      type: "string",
      group: "company",
    }),
    defineField({
      name: "phone",
      title: "Telefonnummer",
      description:
        "Telefonnummer som skal brukes blant annet i kontaktinformasjon",
      type: "string",
      group: "company",
    }),
    defineField({
      name: "email",
      title: "E-post",
      description:
        "E-post-adresse som skal brukes blant annet i kontaktinformasjon",
      type: "string",
      group: "company",
    }),
    defineField({
      name: "organisationNumber",
      title: "Organisasjonsnummer",
      type: "string",
      group: "company",
    }),

    // Meta
    defineField({
      name: "metaTitle",
      title: "Meta - Title-tag",
      type: "string",
      description:
        "Forteller søkemotorer og nettsider hva tittelen på nettsiden er.",
      group: "meta",
    }),
    defineField({
      name: "metaDescription",
      title: "Meta - Description",
      description:
        "Kort beskrivelse av nettsiden for søkemotor-optimalisering. Brukes som standard på forsiden. Undersider får også denne beskrivelsen hvis ikke sidetittel finnes.",
      type: "string",
      group: "meta",
    }),
    defineField({
      name: "metaKeywords",
      title: "Meta - Keywords",
      description: "Liste med nøkkelord for SEO. Separert med komma.",
      type: "string",
      group: "meta",
    }),
    defineField({
      name: "metaOgImage",
      title: "OpenGraph Image ",
      description:
        "Standardbilde for deling i sosiale medier. Helst 1200 x 630 piksler.",
      type: "image",
      group: "meta",
    }),

    // Navbar
    defineField({
      name: "menuItem1",
      title: "Første menyelement du kan endre",
      type: "object",

      fields: [
        defineField({
          name: "title",
          title: "Tittel i menylinjen",
          type: "string",
        }),
        defineField({
          name: "menuLink",
          title: "Siden menyvalget skal føre til (opprettes under 'sider')",
          type: "reference",
          to: { type: "page" },
        }),
      ],
      fieldset: "menuItem1",
      group: "navbar",
    }),
    defineField({
      name: "menuItem2",
      title: " ",
      type: "object",

      fields: [
        defineField({
          name: "title",
          title: "Tittel i menylinjen",
          type: "string",
        }),
        defineField({
          name: "menuLink",
          title: "Siden menyvalget skal føre til (opprettes under 'sider')",
          type: "reference",
          to: { type: "page" },
        }),
      ],
      fieldset: "menuItem2",
      group: "navbar",
    }),
  ],
  preview: {
    prepare() {
      return {
        title: "Endre innstillinger for nettsiden",
      };
    },
  },
});
