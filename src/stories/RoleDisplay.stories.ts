import type { Meta, StoryObj } from "@storybook/react";

import RoleDisplay from "../components/userAdmin/RoleDisplay";

const meta: Meta<typeof RoleDisplay> = {
  title: "RoleDisplay",
  component: RoleDisplay,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  argTypes: {
    roles: {
      table: {
        defaultValue: {
          summary: "user",
        },
      },
    },
  },
} satisfies Meta<typeof RoleDisplay>;

export default meta;
type Story = StoryObj<typeof RoleDisplay>;

export const RolesAll: Story = {
  args: {
    roles: ["admin", "editor", "user"],
  },
};

export const RolesUser: Story = {
  args: {
    roles: ["user"],
  },
};

export const RolesEditor: Story = {
  args: {
    roles: ["editor", "user"],
  },
};
