import type { Meta, StoryObj } from "@storybook/react";

import { Box } from ".";

const meta = {
  title: "Box",
  component: Box,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    box: {},
  },
} satisfies Meta<typeof Box>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Basic: Story = {
  args: {
    box: {
      blocked: false,
      circled: false,
      content: "x",
      shaded: false,
    },
    column: 0,
    row: 0,
    cursor: false,
    cursorAnswer: false,
    remoteCursors: [],
  },
};

export const RemoteCursor: Story = {
  args: {
    box: {
      blocked: false,
      circled: false,
      content: "x",
      shaded: false,
    },
    column: 0,
    row: 0,
    cursor: false,
    cursorAnswer: false,
    remoteCursors: [
      {
        id: "1",
        row: 0,
        column: 0,
        userId: "user-id",
        color: "00FF00",
        displayName: "Test User",
        photoURL:
          "https://lh4.googleusercontent.com/-mvYDpHAbXh8/AAAAAAAAAAI/AAAAAAAAaqM/B1qedASM3dM/photo.jpg",
      },
    ],
  },
};
