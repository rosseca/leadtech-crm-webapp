import type { Route } from "./+types/transactions";
import { TransactionDataTable } from "../ui/data-table";
import { columns } from "../ui/columns";
import { useTransactions } from "../hooks/use-transactions";
import type { Transaction } from "../ui/schema";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Transactions | LeadtechCRM" },
    { name: "description", content: "Manage your transactions" },
  ];
}

export default function Transactions() {
  const { data, isLoading, error } = useTransactions({ limit: 100 });

  const transactions: Transaction[] = data?.data ?? [];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground mt-2">
          View and manage all your transactions in one place.
        </p>
      </div>
      {error && (
        <div className="p-4 mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          Error loading transactions: {error.message}
        </div>
      )}
      <TransactionDataTable
        columns={columns}
        data={transactions}
        isLoading={isLoading}
      />
    </div>
  );
}
