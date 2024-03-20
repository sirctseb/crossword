import type { Meta, StoryObj } from "@storybook/react";

import { UserSection } from ".";

const meta = {
  title: "User/UserSection",
  component: UserSection,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof UserSection>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Basic: Story = {
  args: {
    children: "section content",
  },
};
