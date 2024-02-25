import { ConnectedEditor } from "../../components/Editor/Editor";

export default function UserDashboard({
  params: { crosswordId },
}: {
  params: { crosswordId: string };
}) {
  if (typeof window === "undefined") {
    return null;
  }
  return <ConnectedEditor crosswordId={crosswordId} />;
}
// I love Mamma and Pappa
