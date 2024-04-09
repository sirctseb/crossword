import { block } from "../../../styles";
import { ConnectedCrosswordPreview } from "../../CrosswordPreview";

const bem = block("archive-list");

interface ArchiveListProps {
  archiveList: string[];
}

export const ArchiveList: React.FC<ArchiveListProps> = ({ archiveList }) => {
  return (
    <div className={bem()}>
      <div className={bem("list")}>
        {archiveList.map((crosswordId) => (
          <ConnectedCrosswordPreview id={crosswordId} key={crosswordId} />
        ))}
      </div>
    </div>
  );
};
