import { useRecoilValue } from "recoil";
import { communalCrosswordAtom } from "../../firebase-recoil/atoms";
import { DebugValue } from "../Debug/Debug";

export const CommunalCrossword: React.FC = () => {
  const { current, archive } = useRecoilValue(communalCrosswordAtom);

  return <DebugValue value={{ current, archive }} />;
};
