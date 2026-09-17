import WorkspaceLayout from "@/components/navigation/WorkspaceLayout";
import BackofficeNavigation from "@/components/backoffice/BackofficeNavigation";
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceLayout staff>
      <BackofficeNavigation />
      {children}
    </WorkspaceLayout>
  );
}
