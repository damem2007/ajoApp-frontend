import WorkspaceLayout from "@/components/navigation/WorkspaceLayout";
export default function Layout({ children }: { children: React.ReactNode }) {
  return <WorkspaceLayout>{children}</WorkspaceLayout>;
}
