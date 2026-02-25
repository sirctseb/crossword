import { ConnectedEditor } from "../../../components/Editor/Editor";

export default async function CrosswordEditor(
  props: PageProps<"/xw/[crosswordId]">
) {
  const { crosswordId } = await props.params;
  return <ConnectedEditor crosswordId={crosswordId} />;
}
// I love Mamma and Pappa
