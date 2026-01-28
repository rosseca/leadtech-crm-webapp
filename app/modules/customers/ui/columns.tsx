import { type ColumnDef } from "@tanstack/react-table";
import type {
  Customer,
  LoginWith,
  UserType,
  SubscriptionStatus,
  SubscriptionType,
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

function getLoginWithVariant(
  loginWith: LoginWith
): "default" | "secondary" | "destructive" | "outline" {
  switch (loginWith) {
    case "Google":
      return "default";
    case "Apple":
      return "secondary";
    case "Facebook":
      return "outline";
    case "Email":
    default:
      return "outline";
  }
}

function getUserTypeVariant(
  userType: UserType | undefined
): "default" | "secondary" | "destructive" | "outline" {
  return userType === "pro" ? "default" : "secondary";
}

function getSubscriptionStatusVariant(
  status: SubscriptionStatus | undefined
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Active":
    case "Paying":
      return "default";
    case "Unsubscribed":
      return "destructive";
    case "Non renewal":
      return "secondary";
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

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("email")}</span>
    ),
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("name") || "-"}</span>
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
    accessorKey: "loginWith",
    header: "Login With",
    cell: ({ row }) => {
      const loginWith = row.getValue("loginWith") as LoginWith;
      return (
        <Badge variant={getLoginWithVariant(loginWith)} className="capitalize">
          {loginWith}
        </Badge>
      );
    },
  },
  {
    accessorKey: "customer_id_np",
    header: "Customer ID NP",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.getValue("customer_id_np") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("status") || "-"}</span>
    ),
  },
  {
    accessorKey: "unsubscribed_date",
    header: "Unsubscribed Date",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatDateOnly(row.getValue("unsubscribed_date"))}
      </span>
    ),
  },
  {
    accessorKey: "renewal_date",
    header: "Renewal Date",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatDateOnly(row.getValue("renewal_date"))}
      </span>
    ),
  },
  {
    accessorKey: "retries",
    header: "Retries",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("retries") ?? "-"}</span>
    ),
  },
  {
    accessorKey: "first_transaction_date",
    header: "First Transaction",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatDateOnly(row.getValue("first_transaction_date"))}
      </span>
    ),
  },
  {
    accessorKey: "user_type",
    header: "User Type",
    cell: ({ row }) => {
      const userType = row.getValue("user_type") as UserType | undefined;
      if (!userType) return <span className="text-sm text-muted-foreground">-</span>;
      return (
        <Badge variant={getUserTypeVariant(userType)} className="capitalize">
          {userType}
        </Badge>
      );
    },
  },
  {
    accessorKey: "subscription_status",
    header: "Subscription Status",
    cell: ({ row }) => {
      const status = row.getValue("subscription_status") as SubscriptionStatus | undefined;
      if (!status) return <span className="text-sm text-muted-foreground">-</span>;
      return (
        <Badge variant={getSubscriptionStatusVariant(status)}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "subscription_type",
    header: "Subscription Type",
    cell: ({ row }) => {
      const type = row.getValue("subscription_type") as SubscriptionType | undefined;
      if (!type) return <span className="text-sm text-muted-foreground">-</span>;
      return (
        <span className="text-sm">
          {type} {type === "1" ? "month" : "months"}
        </span>
      );
    },
  },
  {
    accessorKey: "country",
    header: "Country",
    cell: ({ row }) => (
      <span className="text-sm">{row.getValue("country") || "-"}</span>
    ),
  },
  {
    id: "language",
    header: "Language",
    cell: ({ row }) => (
      <span className="text-sm">
        {row.original.language_communication ||
          row.original.language_registration ||
          "-"}
      </span>
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
];
