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
const userTypes = ["all", "free", "pro"];
const subscriptionStatuses = ["all", "Active", "Unsubscribed", "Paying", "Non renewal"];
const subscriptionTypes = ["all", "1", "3", "12"];

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pagination,
  onPageChange,
  onFiltersChange,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [emailSearch, setEmailSearch] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [loginWith, setLoginWith] = useState("all");
  const [userType, setUserType] = useState("all");
  const [subscriptionStatus, setSubscriptionStatus] = useState("all");
  const [subscriptionType, setSubscriptionType] = useState("all");

  // Debounce email search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ email: emailSearch || undefined });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [emailSearch, onFiltersChange]);

  // Debounce name search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ name: nameSearch || undefined });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [nameSearch, onFiltersChange]);

  const handleLoginWithChange = (value: string) => {
    setLoginWith(value);
    onFiltersChange({ loginWith: value === "all" ? undefined : value });
  };

  const handleUserTypeChange = (value: string) => {
    setUserType(value);
    onFiltersChange({ user_type: value === "all" ? undefined : value });
  };

  const handleSubscriptionStatusChange = (value: string) => {
    setSubscriptionStatus(value);
    onFiltersChange({
      subscription_status: value === "all" ? undefined : value,
    });
  };

  const handleSubscriptionTypeChange = (value: string) => {
    setSubscriptionType(value);
    onFiltersChange({
      subscription_type: value === "all" ? undefined : value,
    });
  };

  const handleClearFilters = () => {
    setEmailSearch("");
    setNameSearch("");
    setLoginWith("all");
    setUserType("all");
    setSubscriptionStatus("all");
    setSubscriptionType("all");
    onFiltersChange({
      email: undefined,
      name: undefined,
      loginWith: undefined,
      user_type: undefined,
      subscription_status: undefined,
      subscription_type: undefined,
    });
  };

  const hasFilters =
    emailSearch ||
    nameSearch ||
    loginWith !== "all" ||
    userType !== "all" ||
    subscriptionStatus !== "all" ||
    subscriptionType !== "all";

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount: pagination.totalPages,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Email..."
          value={emailSearch}
          onChange={(event) => setEmailSearch(event.target.value)}
          className="w-[160px]"
        />
        <Input
          placeholder="Name..."
          value={nameSearch}
          onChange={(event) => setNameSearch(event.target.value)}
          className="w-[140px]"
        />
        <Select value={loginWith} onValueChange={handleLoginWithChange}>
          <SelectTrigger className="w-[130px]">
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
        <Select value={userType} onValueChange={handleUserTypeChange}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="User Type" />
          </SelectTrigger>
          <SelectContent>
            {userTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "all" ? "All Types" : type === "free" ? "Free" : "Pro"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={subscriptionStatus}
          onValueChange={handleSubscriptionStatusChange}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Sub Status" />
          </SelectTrigger>
          <SelectContent>
            {subscriptionStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "all" ? "All Statuses" : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={subscriptionType}
          onValueChange={handleSubscriptionTypeChange}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Sub Type" />
          </SelectTrigger>
          <SelectContent>
            {subscriptionTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "all"
                  ? "All Plans"
                  : `${type} ${type === "1" ? "month" : "months"}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="outline" size="sm" onClick={handleClearFilters}>
            Clear
          </Button>
        )}
      </div>
      <div className="rounded-md border overflow-x-auto">
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
