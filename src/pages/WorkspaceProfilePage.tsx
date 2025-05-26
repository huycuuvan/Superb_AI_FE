import { useParams } from "react-router-dom";
import { WorkspaceProfileForm } from "@/components/workspace/WorkspaceProfile";

export default function WorkspaceProfilePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();

  if (!workspaceId) {
    return <div>Không tìm thấy ID workspace</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <WorkspaceProfileForm workspaceId={workspaceId} />
    </div>
  );
} 