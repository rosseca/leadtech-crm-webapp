import { type ColumnDef } from "@tanstack/react-table";
import type { Customer, LoginWith } from "./schema";
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

function getVerifiedVariant(
  verified: boolean
): "default" | "secondary" | "destructive" | "outline" {
  return verified ? "default" : "destructive";
}

export const columns: ColumnDef<Customer>[] = [
  {
    accessorKey: "id",
    header: "Customer ID",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue("id")}</span>
    ),
  },
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
    accessorKey: "email_verified",
    header: "Verified",
    cell: ({ row }) => {
      const verified = row.getValue("email_verified") as boolean;
      return (
        <Badge variant={getVerifiedVariant(verified)}>
          {verified ? "Yes" : "No"}
        </Badge>
      );
    },
    filterFn: (row, id, value: string) => {
      if (value === "all") return true;
      const verified = row.getValue(id) as boolean;
      return value === "true" ? verified : !verified;
    },
  },
  {
    accessorKey: "loginWith",
    header: "Login Method",
    cell: ({ row }) => {
      const loginWith = row.getValue("loginWith") as LoginWith;
      return (
        <Badge variant={getLoginWithVariant(loginWith)} className="capitalize">
          {loginWith}
        </Badge>
      );
    },
    filterFn: (row, id, value: string[]) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "company_name",
    header: "Company",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.getValue("company_name") || "-"}
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
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }) => (
      <span className="text-sm">{formatDate(row.getValue("created_at"))}</span>
    ),
  },
];
