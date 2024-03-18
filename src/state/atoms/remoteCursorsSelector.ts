import { selectorFamily, type SerializableParam } from "recoil";
import type { Cursor } from "../../firebase/types";
import { cursorsAtomFamily } from "../../firebase-recoil/atoms";

type RemoteCursorsParams = SerializableParam & {
  cursorId: string;
  crosswordId: string;
};

export const remoteCursorsSelector = selectorFamily<
  Record<string, Cursor>,
  RemoteCursorsParams
>({
  key: "remote-cursors",
  get:
    ({ crosswordId, cursorId }) =>
    ({ get }) => {
      const data = { ...get(cursorsAtomFamily({ crosswordId })) };

      delete data[cursorId];

      return data;
    },
});
