import { useState, useEffect } from "react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { CustomersListParams } from "~/lib/api";

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  onFiltersChange: (filters: Partial<CustomersListParams>) => void;
  onRowClick?: (row: TData) => void;
}

const loginMethods = ["all", "Google", "Facebook", "Apple", "Email"];
const verifiedOptions = ["all", "true", "false"];

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pagination,
  onPageChange,
  onFiltersChange,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [search, setSearch] = useState("");
  const [loginWith, setLoginWith] = useState("all");
  const [emailVerified, setEmailVerified] = useState("all");

  // Debounce search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ search: search || undefined });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [search, onFiltersChange]);

  const handleLoginWithChange = (value: string) => {
    setLoginWith(value);
    onFiltersChange({ loginWith: value === "all" ? undefined : value });
  };

  const handleEmailVerifiedChange = (value: string) => {
    setEmailVerified(value);
    onFiltersChange({
      email_verified: value === "all" ? undefined : value === "true",
    });
  };

  const handleClearFilters = () => {
    setSearch("");
    setLoginWith("all");
    setEmailVerified("all");
    onFiltersChange({
      search: undefined,
      loginWith: undefined,
      email_verified: undefined,
    });
  };

  const hasFilters = search || loginWith !== "all" || emailVerified !== "all";

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="Search by name, email, or company..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        <Select value={loginWith} onValueChange={handleLoginWithChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Login Method" />
          </SelectTrigger>
          <SelectContent>
            {loginMethods.map((method) => (
              <SelectItem key={method} value={method}>
                {method === "all" ? "All Methods" : method}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={emailVerified} onValueChange={handleEmailVerifiedChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Verified" />
          </SelectTrigger>
          <SelectContent>
            {verifiedOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {option === "all"
                  ? "All"
                  : option === "true"
                    ? "Verified"
                    : "Not Verified"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="outline" onClick={handleClearFilters}>
            Clear Filters
          </Button>
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row.original)}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {data.length} of {pagination.total} customers
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1 || isLoading}
          >
            Previous
          </Button>
          <div className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
