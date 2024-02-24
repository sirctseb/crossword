import type { Meta, StoryObj } from "@storybook/react";

import { ClueList } from ".";

const meta = {
  title: "ClueList",
  component: ClueList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {},
} satisfies Meta<typeof ClueList>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Basic: Story = {
  args: {
    clueData: [
      ["", "", "1", "", "2", "", "3"],
      ["", "4", "", "5", "", "6", ""],
      ["7", "", "8", "", "9", "", "10"],
    ],
    clueInput: {
      row: 0,
      column: 0,
      direction: "across",
      value: "hello",
    },
    clueLabels: [
      { row: 0, column: 0, label: "1" },
      { row: 0, column: 4, label: "2" },
      { row: 0, column: 6, label: "3" },
      { row: 1, column: 1, label: "4" },
      { row: 1, column: 3, label: "5" },
      { row: 1, column: 5, label: "6" },
      { row: 2, column: 0, label: "7" },
      { row: 2, column: 2, label: "8" },
      { row: 2, column: 4, label: "9" },
      { row: 2, column: 6, label: "10" },
    ],
    direction: "across",
  },
};
