import { useRemoteCursors as useFirebaseRemoteCursors } from "../../firebase-hooks/hooks";
import type { CursorMap } from "../../../state/atoms/firebaseAtoms";

export const useRemoteCursors = (
  crosswordId: string,
  cursorId: string | null
): CursorMap => {
  return useFirebaseRemoteCursors(crosswordId, cursorId);
};
