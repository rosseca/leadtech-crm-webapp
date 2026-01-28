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
import type { TransactionsListParams } from "~/lib/api";

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
  onFiltersChange: (filters: Partial<TransactionsListParams>) => void;
}

const transactionStatuses = [
  "all",
  "success",
  "failed",
  "in_process",
  "waiting_user_interaction",
];

const transactionTypes = ["all", "payment", "refund", "chargeback", "rdr"];

const currencies = ["all", "EUR", "USD", "GBP"];

const statusLabels: Record<string, string> = {
  all: "All Statuses",
  success: "Success",
  failed: "Failed",
  in_process: "In Process",
  waiting_user_interaction: "Waiting",
};

export function TransactionDataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  pagination,
  onPageChange,
  onFiltersChange,
}: DataTableProps<TData, TValue>) {
  const [emailSearch, setEmailSearch] = useState("");
  const [transactionIdSearch, setTransactionIdSearch] = useState("");
  const [orderNumberSearch, setOrderNumberSearch] = useState("");
  const [binSearch, setBinSearch] = useState("");
  const [last4Search, setLast4Search] = useState("");
  const [cardHolderSearch, setCardHolderSearch] = useState("");
  const [transactionStatus, setTransactionStatus] = useState("all");
  const [transactionType, setTransactionType] = useState("all");
  const [currency, setCurrency] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Debounce email search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ email: emailSearch || undefined });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [emailSearch, onFiltersChange]);

  // Debounce transaction ID search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ id_transaction: transactionIdSearch || undefined });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [transactionIdSearch, onFiltersChange]);

  // Debounce order number search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ order_number: orderNumberSearch || undefined });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [orderNumberSearch, onFiltersChange]);

  // Debounce BIN search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ bin: binSearch || undefined });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [binSearch, onFiltersChange]);

  // Debounce last 4 digits search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ last_4: last4Search || undefined });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [last4Search, onFiltersChange]);

  // Debounce card holder name search input
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onFiltersChange({ card_holder_name: cardHolderSearch || undefined });
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [cardHolderSearch, onFiltersChange]);

  const handleTransactionStatusChange = (value: string) => {
    setTransactionStatus(value);
    onFiltersChange({
      transaction_status: value === "all" ? undefined : value,
    });
  };

  const handleTransactionTypeChange = (value: string) => {
    setTransactionType(value);
    onFiltersChange({
      transaction_type: value === "all" ? undefined : value,
    });
  };

  const handleCurrencyChange = (value: string) => {
    setCurrency(value);
    onFiltersChange({
      currency: value === "all" ? undefined : value,
    });
  };

  const handleDateFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateFrom(value);
    onFiltersChange({
      date_from: value || undefined,
    });
  };

  const handleDateToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateTo(value);
    onFiltersChange({
      date_to: value || undefined,
    });
  };

  const handleClearFilters = () => {
    setEmailSearch("");
    setTransactionIdSearch("");
    setOrderNumberSearch("");
    setBinSearch("");
    setLast4Search("");
    setCardHolderSearch("");
    setTransactionStatus("all");
    setTransactionType("all");
    setCurrency("all");
    setDateFrom("");
    setDateTo("");
    onFiltersChange({
      email: undefined,
      id_transaction: undefined,
      order_number: undefined,
      bin: undefined,
      last_4: undefined,
      card_holder_name: undefined,
      transaction_status: undefined,
      transaction_type: undefined,
      currency: undefined,
      date_from: undefined,
      date_to: undefined,
    });
  };

  const hasFilters =
    emailSearch ||
    transactionIdSearch ||
    orderNumberSearch ||
    binSearch ||
    last4Search ||
    cardHolderSearch ||
    transactionStatus !== "all" ||
    transactionType !== "all" ||
    currency !== "all" ||
    dateFrom ||
    dateTo;

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
          className="w-[140px]"
        />
        <Input
          placeholder="Transaction ID..."
          value={transactionIdSearch}
          onChange={(event) => setTransactionIdSearch(event.target.value)}
          className="w-[130px]"
        />
        <Input
          placeholder="Order #..."
          value={orderNumberSearch}
          onChange={(event) => setOrderNumberSearch(event.target.value)}
          className="w-[110px]"
        />
        <Input
          placeholder="BIN..."
          value={binSearch}
          onChange={(event) => setBinSearch(event.target.value)}
          className="w-[80px]"
        />
        <Input
          placeholder="Last 4..."
          value={last4Search}
          onChange={(event) => setLast4Search(event.target.value)}
          className="w-[80px]"
        />
        <Input
          placeholder="Card Holder..."
          value={cardHolderSearch}
          onChange={(event) => setCardHolderSearch(event.target.value)}
          className="w-[120px]"
        />
        <Select
          value={transactionStatus}
          onValueChange={handleTransactionStatusChange}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {transactionStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabels[status] ||
                  status.charAt(0).toUpperCase() + status.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={transactionType}
          onValueChange={handleTransactionTypeChange}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {transactionTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "all"
                  ? "All Types"
                  : type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={currency} onValueChange={handleCurrencyChange}>
          <SelectTrigger className="w-[110px]">
            <SelectValue placeholder="Currency" />
          </SelectTrigger>
          <SelectContent>
            {currencies.map((curr) => (
              <SelectItem key={curr} value={curr}>
                {curr === "all" ? "All Currencies" : curr}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">From:</span>
          <Input
            type="date"
            value={dateFrom}
            onChange={handleDateFromChange}
            className="w-[130px]"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">To:</span>
          <Input
            type="date"
            value={dateTo}
            onChange={handleDateToChange}
            className="w-[130px]"
          />
        </div>
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
          Showing {data.length} of {pagination.total} transactions
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
