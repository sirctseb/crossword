import { block } from "../../../styles";
import { ConnectedCrosswordPreview } from "../../CrosswordPreview";

const bem = block("archive-list");
import "./archive-list.scss";

interface ArchiveListProps {
  archiveList: string[];
  onCurrentClick: () => void;
  current: string;
}

export const ArchiveList: React.FC<ArchiveListProps> = ({
  archiveList,
  onCurrentClick,
  current,
}) => {
  return (
    <div className={bem()}>
      <div className={bem("list")}>
        {archiveList.map((crosswordId) => (
          <ConnectedCrosswordPreview id={crosswordId} key={crosswordId} />
        ))}
      </div>
      <div className={bem("current")} onClick={onCurrentClick}>
        <div className={bem("relative-reset")}>
          <div className={bem("current-actuator")}>&gt;</div>
          <div className={bem("previews")}>
            <ConnectedCrosswordPreview id={current} />
          </div>
        </div>
      </div>
    </div>
  );
};
