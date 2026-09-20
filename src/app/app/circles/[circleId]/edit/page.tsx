import CircleDetail from "@/components/circles/CircleDetail";
export default async function Page({
  params,
}: {
  params: Promise<{ circleId: string }>;
}) {
  const { circleId } = await params;
  return <CircleDetail id={circleId} edit />;
}
