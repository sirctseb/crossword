import { block } from "../../../styles";

import { useAtomValue } from "jotai";
import { crosswordFullAtomFamily } from "../../../state/atoms/selectors";
import { useFirebase } from "../../../firebase";

const bem = block("extras");

interface ExtrasProps {
  children: React.ReactNode;
  id: string;
}

export const Extras = ({ children, id }: ExtrasProps) => {
  const full = useAtomValue(crosswordFullAtomFamily({ crosswordId: id }));
  const {
    functions: { finishCommunalCrossword },
  } = useFirebase();
  return (
    <div className={bem()}>
      {children}
      {full && (
        <button
          className={bem("finish")}
          onClick={() => finishCommunalCrossword()}
        >
          Finish
        </button>
      )}
    </div>
  );
};

export default Extras;
