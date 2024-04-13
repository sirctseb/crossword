import { useRecoilValue } from "recoil";
import { communalCrosswordAtom } from "../../firebase-recoil/atoms";
import { block } from "../../styles";
import { useCallback, useMemo, useState } from "react";
import { ArchiveList } from "./ArchiveList";

const bem = block("communal-crossword");

enum Selection {
  None = "None",
  Current = "Current",
}

export const CommunalCrossword: React.FC = () => {
  const [selectedCrossword, setSelectedCrossword] = useState<string>(
    Selection.Current
  );
  const { current, archive } = useRecoilValue(communalCrosswordAtom);

  // TODO selector?
  const archiveList = useMemo(() => Object.values(archive || {}), [archive]);

  const onCurrentClick = useCallback(() => {
    setSelectedCrossword(current);
  }, [current]);

  return (
    <div className={bem()}>
      <h2>Communal Crossword</h2>
      <ArchiveList
        archiveList={archiveList}
        current={current}
        onCurrentClick={onCurrentClick}
      />
    </div>
  );
};
