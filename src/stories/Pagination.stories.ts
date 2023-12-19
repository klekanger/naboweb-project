import type { Meta, StoryObj } from "@storybook/react";

import Pagination from "../components/Pagination";

const meta = {
  title: "Pagination",
  component: Pagination,
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {
  args: {
    pageNumber: 1,
    totalPages: 10,
    url: "/",
  },
};

export const SecondPage: Story = {
  args: {
    pageNumber: 2,
    totalPages: 10,
    url: "/",
  },
};

export const LastPage: Story = {
  args: {
    pageNumber: 10,
    totalPages: 10,
    url: "/",
  },
};
