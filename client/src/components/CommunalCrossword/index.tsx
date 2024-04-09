import { useRecoilValue } from "recoil";
import { communalCrosswordAtom } from "../../firebase-recoil/atoms";
import { block } from "../../styles";
import { useMemo } from "react";
import { ArchiveList } from "./ArchiveList";

const bem = block("communal-crossword");

export const CommunalCrossword: React.FC = () => {
  const { current, archive } = useRecoilValue(communalCrosswordAtom);

  // TODO selector?
  const archiveList = useMemo(() => Object.values(archive || {}), [archive]);

  return (
    <div className={bem()}>
      <h2>Communal Crossword</h2>
      <ArchiveList archiveList={archiveList} />
    </div>
  );
};
