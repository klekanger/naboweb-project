import type { Meta, StoryObj } from "@storybook/react";
import UserTable from "../components/userAdmin/UserTable";
import type { UsersWithEmails } from "../types/types";

const meta = {
  title: "UserTable",
  component: UserTable,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
} satisfies Meta<typeof UserTable>;

export default meta;
type Story = StoryObj<typeof meta>;

function mockUsers(numberOfUsers = 1): UsersWithEmails[] {
  const users: UsersWithEmails[] = [];
  for (let i = 1; i <= numberOfUsers; i++) {
    const randomRole = ["admin", "editor", "user"]
      .map((role) => {
        if (Math.random() > 0.5) {
          return role;
        } else return null;
      })
      .filter((role) => role !== null);

    const user = {
      id: `${i}`,
      createdAt: new Date().getTime(),
      roles: randomRole,
      firstName: `Firstname ${i}`,
      lastName: `Lastname ${i}`,
      email: `user${i}@example.com`,
    };
    users.push(user);
  }

  return users;
}

export const TableWithNoUsers: Story = {
  args: {
    users: mockUsers(0),
  },
};

export const TableWithOneUser: Story = {
  args: {
    users: mockUsers(1),
  },
};
export const TableWithPagination: Story = {
  args: {
    users: mockUsers(30),
  },
};
