import type { StatementDTO } from "../types";
import { StatementRow } from "./statement-row";

export function StatementList({ statements }: { statements: StatementDTO[] }) {
  if (statements.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--tk-border)] bg-white p-8 text-center text-[var(--tk-fg-2)]">
        No statements yet. Add the first billing period for this card.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-[var(--tk-border)] bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-[var(--tk-border)] bg-[var(--tk-bg-1)] text-[var(--tk-fg-3)]">
          <tr>
            <th className="px-3 py-2 font-medium">Period</th>
            <th className="px-3 py-2 font-medium">Closing balance</th>
            <th className="px-3 py-2 font-medium">Minimum due</th>
            <th className="px-3 py-2 font-medium">Due date</th>
            <th className="px-3 py-2 font-medium">Document</th>
          </tr>
        </thead>
        <tbody>
          {statements.map((statement) => (
            <StatementRow key={statement.id} statement={statement} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
