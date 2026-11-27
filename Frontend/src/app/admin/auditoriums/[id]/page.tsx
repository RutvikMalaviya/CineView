import { AuditoriumEditorView } from "@/features/admin/components/AuditoriumEditorView";

export default async function AdminAuditoriumEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AuditoriumEditorView auditoriumId={id} />;
}
