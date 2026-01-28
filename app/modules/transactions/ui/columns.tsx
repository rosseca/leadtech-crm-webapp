import { type ColumnDef } from "@tanstack/react-table";
import type {
  Transaction,
  TransactionStatus,
  TransactionType,
  PaymentType,
  SubscriptionPlan,
  Provider,
} from "./schema";
import { Badge } from "~/components/ui/badge";

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function formatDateOnly(dateStr: string | null | undefined): string {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount / 100); // Amount is typically in cents
  } catch {
    return `${currency} ${(amount / 100).toFixed(2)}`;
  }
}

function getStatusVariant(
  status: TransactionStatus
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "success":
      return "default";
    case "in_process":
    case "waiting_user_interaction":
      return "secondary";
    case "failed":
      return "destructive";
    default:
      return "outline";
  }
}

function getTypeVariant(
  type: TransactionType
): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case "payment":
      return "default";
    case "refund":
      return "destructive";
    case "chargeback":
      return "destructive";
    case "rdr":
      return "outline";
    default:
      return "outline";
  }
}

function getPaymentTypeVariant(
  type: PaymentType
): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case "initial":
      return "default";
    case "recurring":
      return "secondary";
    case "upgrade":
      return "outline";
    default:
      return "outline";
  }
}

function getProviderVariant(
  provider: Provider | undefined
): "default" | "secondary" | "destructive" | "outline" {
  return provider === "stripe" ? "default" : "secondary";
}

function formatProvider(provider: Provider | undefined): string {
  if (!provider) return "-";
  return provider === "stripe" ? "Stripe" : "Macropay";
}

function formatStatus(status: TransactionStatus): string {
  const labels: Record<TransactionStatus, string> = {
    success: "Success",
    failed: "Failed",
    in_process: "In Process",
    waiting_user_interaction: "Waiting",
  };
  return labels[status] || status;
}

export const columns: ColumnDef<Transaction>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("email") || "-"}</span>
    ),
  },
  {
    accessorKey: "id_transaction",
    header: "Transaction ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.getValue("id_transaction")}
      </span>
    ),
  },
  {
    accessorKey: "subscription_id",
    header: "Subscription ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.getValue("subscription_id") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "subscription_plan",
    header: "Subscription Plan",
    cell: ({ row }) => {
      const plan = row.getValue("subscription_plan") as SubscriptionPlan | undefined;
      if (!plan) return <span className="text-sm text-muted-foreground">-</span>;
      return (
        <span className="text-sm">
          {plan} {plan === "1" ? "month" : "months"}
        </span>
      );
    },
  },
  {
    accessorKey: "subscription_status",
    header: "Subscription Status",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("subscription_status") || "-"}</span>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.getValue("created_at"))}</span>
    ),
  },
  {
    accessorKey: "transaction_type",
    header: "Transaction Type",
    cell: ({ row }) => {
      const type = row.getValue("transaction_type") as TransactionType;
      return (
        <Badge variant={getTypeVariant(type)} className="capitalize">
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "transaction_status",
    header: "Transaction Status",
    cell: ({ row }) => {
      const status = row.getValue("transaction_status") as TransactionStatus;
      return (
        <Badge variant={getStatusVariant(status)}>{formatStatus(status)}</Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number;
      const currency = row.original.currency;
      return (
        <span
          className={`text-sm font-medium ${
            row.original.transaction_type === "refund" ||
            row.original.transaction_type === "chargeback"
              ? "text-destructive"
              : ""
          }`}
        >
          {formatCurrency(amount, currency)}
        </span>
      );
    },
  },
  {
    accessorKey: "currency",
    header: "Currency",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("currency")}</span>
    ),
  },
  {
    accessorKey: "country",
    header: "Country",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("country") || "-"}</span>
    ),
  },
  {
    accessorKey: "provider",
    header: "Provider",
    cell: ({ row }) => {
      const provider = row.getValue("provider") as Provider | undefined;
      if (!provider) return <span className="text-sm text-muted-foreground">-</span>;
      return (
        <Badge variant={getProviderVariant(provider)}>
          {formatProvider(provider)}
        </Badge>
      );
    },
  },
  {
    accessorKey: "payment_type",
    header: "Payment Type",
    cell: ({ row }) => {
      const type = row.getValue("payment_type") as PaymentType;
      return (
        <Badge variant={getPaymentTypeVariant(type)} className="capitalize">
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "normalized_card_brand",
    header: "Card Brand",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("normalized_card_brand") || "-"}</span>
    ),
  },
  {
    accessorKey: "card_holder_name",
    header: "Card Holder",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("card_holder_name") || "-"}</span>
    ),
  },
  {
    accessorKey: "bin",
    header: "BIN",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("bin") || "-"}</span>
    ),
  },
  {
    accessorKey: "last_4",
    header: "Last 4",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("last_4") || "-"}</span>
    ),
  },
  {
    accessorKey: "payment_date",
    header: "Payment Date",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatDateOnly(row.getValue("payment_date"))}
      </span>
    ),
  },
  {
    accessorKey: "next_transaction_date",
    header: "Next Transaction",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatDateOnly(row.getValue("next_transaction_date"))}
      </span>
    ),
  },
  {
    accessorKey: "refund_date",
    header: "Refund Date",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatDateOnly(row.getValue("refund_date"))}
      </span>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Updated At",
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.getValue("updated_at"))}</span>
    ),
  },
];
