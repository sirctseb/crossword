import { block } from "../../styles";
import { useCallback, useMemo, useState } from "react";
import { ArchiveList } from "./ArchiveList";
import CommunalEditLayout from "./Layout/CommunalEditLayout";
import { ConnectedCrosswordPreview } from "../CrosswordPreview";
import { ConnectedEditor } from "../Editor/Editor";
import { DebugValue } from "../Debug/Debug";
import { useAtomValue } from "jotai";
import { communalCrosswordAtom } from "../../state/atoms/firebaseAtoms";
import { Extras } from "./Extras";

const bem = block("communal-crossword");
import "./communal-crossword.scss";

enum Selection {
  None = "None",
  Current = "Current",
}

export const CommunalCrossword: React.FC = () => {
  const [selectedCrossword, setSelectedCrossword] = useState<string>(
    Selection.Current
  );

  const { current, archive } = useAtomValue(communalCrosswordAtom);

  const focusedCrossword = selectedCrossword || current;
  const editing =
    focusedCrossword === current || focusedCrossword === Selection.Current;

  // TODO selector?
  const archiveList = useMemo(() => Object.values(archive || {}), [archive]);

  const onCurrentClick = useCallback(() => {
    setSelectedCrossword(current);
  }, [current]);

  const onPreviousClick = useCallback(() => {
    setSelectedCrossword(Selection.None);
  }, []);

  return (
    <div className={bem()}>
      <h2>Communal Crossword</h2>
      {editing ? (
        <CommunalEditLayout onPreviousClick={onPreviousClick}>
          <ConnectedCrosswordPreview id={archiveList[archiveList.length - 1]} />
          <Extras id={current}>
            <ConnectedEditor
              crosswordId={current}
              showClues={false}
              showThemeEntries={false}
            />
          </Extras>
        </CommunalEditLayout>
      ) : (
        <ArchiveList
          archiveList={archiveList}
          current={current}
          onCurrentClick={onCurrentClick}
        />
      )}
    </div>
  );
};
