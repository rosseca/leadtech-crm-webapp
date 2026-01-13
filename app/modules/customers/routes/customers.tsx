import type { Route } from "./+types/customers";
import { DataTable } from "../ui/data-table";
import { columns } from "../ui/columns";
import { useCustomers } from "../hooks/use-customers";
import type { Customer } from "../ui/schema";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Customers | LeadtechCRM" },
    { name: "description", content: "Manage your customers" },
  ];
}

export default function Customers() {
  const { data, isLoading, error } = useCustomers({ limit: 100 });

  const customers: Customer[] = data?.data ?? [];

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground mt-2">
          Manage and view all your customers in one place.
        </p>
      </div>
      {error && (
        <div className="p-4 mb-4 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          Error loading customers: {error.message}
        </div>
      )}
      <DataTable columns={columns} data={customers} isLoading={isLoading} />
    </div>
  );
}
