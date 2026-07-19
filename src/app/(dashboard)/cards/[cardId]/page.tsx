import { redirect } from "next/navigation";

type PageProps = {
  params: Promise<{ cardId: string }>;
};

export default async function CardDetailPage({ params }: PageProps) {
  const { cardId } = await params;
  // Slice #4: statements is the primary nested surface until activity ships.
  redirect(`/cards/${cardId}/statements`);
}
