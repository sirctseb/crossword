import { ConnectedEditor } from "../../components/Editor/Editor";

export default function CrosswordEditor({
  params: { crosswordId },
}: {
  params: { crosswordId: string };
}) {
  return <ConnectedEditor crosswordId={crosswordId} />;
}
// I love Mamma and Pappa
