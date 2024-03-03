import { useHotkeys } from "react-hotkeys-hook";

import { cursorAtom } from "../../state";
import { useRecoilState } from "recoil";

export const useEditoHotkeys = () => {
  const [cursor, setCursor] = useRecoilState(cursorAtom);

  useHotkeys(";", () => {
    setCursor((cursor) => ({
      ...cursor,
      direction: cursor.direction === "across" ? "down" : "across",
    }));
  });
};
