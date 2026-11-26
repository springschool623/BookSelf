import { MindMapEditorLoader } from '@/features/mindmap/MindMapEditorLoader';

export default async function MindMapPage({
  params,
}: {
  params: Promise<{ id: string; mapId: string }>;
}) {
  const { id, mapId } = await params;
  return <MindMapEditorLoader bookId={id} mapId={mapId} />;
}
