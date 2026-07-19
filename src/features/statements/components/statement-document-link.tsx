export function StatementDocumentLink({
  documentUrl,
}: {
  documentUrl: string | null;
}) {
  if (!documentUrl) {
    return <span className="text-[var(--tk-fg-3)]">—</span>;
  }

  return (
    <a
      href={documentUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[var(--tk-com)] hover:underline"
    >
      PDF
    </a>
  );
}
