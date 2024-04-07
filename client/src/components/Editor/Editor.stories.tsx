import type { Meta, StoryObj } from "@storybook/react";

import { Editor, type EditorProps } from "./Editor";
import { makeCrossword } from "../../state/factory/makeCrossword";
import { deriveClueAddresses, deriveLabelMap } from "../../state/derivations";
import { useIsCursorAnswer } from "./hooks/useIsCursorAnswer";
import type { Cursor } from "../../state";

type EditorPropsAndCustomArgs = React.ComponentProps<typeof Editor> & {
  shorthand: string;
};

const meta = {
  title: "Editor",
  component: Editor,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    shorthand: {
      control: {
        type: "text",
      },
    },
  },
  render: ({ shorthand, ...args }) => {
    const crossword = makeCrossword(shorthand.split("\n"));
    const clueAddresses = deriveClueAddresses(crossword);
    const cursor: Cursor = {
      row: 0,
      column: 0,
      direction: "across",
    };
    const isCursorAnswer = useIsCursorAnswer(crossword, cursor);
    const props: EditorProps = {
      ...args,
      labelMap: deriveLabelMap(clueAddresses), // TODO need the addresses
      crossword,
      isCursorAnswer,
      labeledAddressCatalog: { across: [], down: [] },
    };

    return <Editor {...props} />;
  },
} satisfies Meta<EditorPropsAndCustomArgs>;

export default meta;
type Story = StoryObj<EditorPropsAndCustomArgs>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Basic: Story = {
  args: {
    allAnswers: [],
    clueInput: {
      column: 0,
      row: 0,
      value: "",
      direction: "across",
    },
    shorthand: "---\n-b-\n---",
    isCursorBox: () => false,
    remoteCursors: {
      0: {
        0: [
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
    },
  },
};
