import type { StatementDTO } from "../types";
import { formatDateShort } from "@/lib/formatting/dates";
import { StatementDocumentLink } from "./statement-document-link";

export function StatementRow({ statement }: { statement: StatementDTO }) {
  return (
    <tr className="border-b border-[var(--tk-border)] last:border-0">
      <td className="px-3 py-3">
        {formatDateShort(statement.periodStart)} –{" "}
        {formatDateShort(statement.periodEnd)}
      </td>
      <td className="px-3 py-3 tabular-nums">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: statement.currency,
        }).format(statement.closingBalanceMinor / 100)}
      </td>
      <td className="px-3 py-3 tabular-nums">
        {new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: statement.currency,
        }).format(statement.minimumPaymentMinor / 100)}
      </td>
      <td className="px-3 py-3">
        {statement.paymentDueDate
          ? formatDateShort(statement.paymentDueDate)
          : "—"}
      </td>
      <td className="px-3 py-3">
        <StatementDocumentLink documentUrl={statement.documentUrl} />
      </td>
    </tr>
  );
}
