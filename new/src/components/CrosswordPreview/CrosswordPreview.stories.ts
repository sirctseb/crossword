import type { Meta, StoryObj } from "@storybook/react";

import { CrosswordPreview } from ".";

const meta = {
  title: "CrosswordPreview",
  component: CrosswordPreview,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof CrosswordPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Basic: Story = {
  args: {
    crossword: {
      rows: 10,
      symmetric: true,
      boxes: [[{ blocked: true, circled: true, content: "x", shaded: true }]],
      clues: {
        down: {
          "0": {
            "0": "zero-zero clue",
          },
        },
      },
      title: "Title",
    },
    metadata: {
      title: "Title in metadata",
    },
  },
};
