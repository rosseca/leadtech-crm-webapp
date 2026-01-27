import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "~/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";
import { useCustomerTransactions } from "../hooks/use-customer-transactions";
import { useRefund } from "../hooks/use-refund";
import { useCustomerNotes } from "../hooks/use-notes";
import { NotesModal } from "./notes-modal";
import type { UserTransaction } from "~/lib/api";

interface CustomerDetailModalProps {
  customerId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

function formatCurrency(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(amount / 100);
  } catch {
    return `${currency} ${(amount / 100).toFixed(2)}`;
  }
}

function getStatusVariant(
  status: string
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
  type: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (type) {
    case "payment":
      return "default";
    case "refund":
    case "chargeback":
      return "destructive";
    default:
      return "outline";
  }
}

function formatStatus(status: string): string {
  const labels: Record<string, string> = {
    success: "Success",
    failed: "Failed",
    in_process: "In Process",
    waiting_user_interaction: "Waiting",
  };
  return labels[status] || status;
}

export function CustomerDetailModal({
  customerId,
  open,
  onOpenChange,
}: CustomerDetailModalProps) {
  const [refundingId, setRefundingId] = useState<string | null>(null);
  const [confirmRefund, setConfirmRefund] = useState<UserTransaction | null>(null);
  const [notesModalOpen, setNotesModalOpen] = useState(false);

  const { data, isLoading, error } = useCustomerTransactions(customerId);
  const { data: notes } = useCustomerNotes(customerId);
  const refundMutation = useRefund();

  const hasNotes = notes && notes.length > 0;

  const handleRefund = async (transaction: UserTransaction) => {
    setRefundingId(transaction.id_transaction);
    try {
      await refundMutation.mutateAsync({
        chargeId: transaction.id_transaction,
        reason: "requested_by_customer",
      });
      setConfirmRefund(null);
    } catch (err) {
      console.error("Refund failed:", err);
    } finally {
      setRefundingId(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>
              View customer information and transaction history
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : error ? (
            <div className="text-destructive text-center py-8">
              Failed to load customer data. Please try again.
            </div>
          ) : data ? (
            <div className="space-y-6">
              {/* Customer Info */}
              <Card className="p-4">
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="font-medium">{data.user.email}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Company Name:</span>
                    <p className="font-medium">{data.user.company_name || "-"}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created:</span>
                    <p className="font-medium">{formatDate(data.user.created_at)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Language:</span>
                    <p className="font-medium uppercase">
                      {data.user.language || "-"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Transactions Table */}
              <div>
                <h3 className="font-semibold mb-3">Transactions</h3>
                {data.transactions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">
                    No transactions found
                  </p>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Payment</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.transactions.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-sm">
                              {formatDate(tx.payment_date || tx.created_at)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={getTypeVariant(tx.transaction_type)}
                                className="capitalize"
                              >
                                {tx.transaction_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={getStatusVariant(tx.transaction_status)}>
                                {formatStatus(tx.transaction_status)}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className={`font-medium ${
                                tx.transaction_type === "refund" ||
                                tx.transaction_type === "chargeback"
                                  ? "text-destructive"
                                  : ""
                              }`}
                            >
                              {formatCurrency(tx.amount, tx.currency)}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {tx.payment_type}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {tx.can_refund ? (
                                confirmRefund?.id === tx.id ? (
                                  <div className="flex gap-1">
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => handleRefund(tx)}
                                      disabled={refundingId === tx.id_transaction}
                                    >
                                      {refundingId === tx.id_transaction
                                        ? "Processing..."
                                        : "Confirm"}
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => setConfirmRefund(null)}
                                      disabled={refundingId === tx.id_transaction}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setConfirmRefund(tx)}
                                  >
                                    Refund
                                  </Button>
                                )
                              ) : tx.refund_status === "refunded" ? (
                                <Button size="sm" variant="outline" disabled>
                                  Refunded
                                </Button>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  -
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>

              {/* Refund Mutation Error */}
              {refundMutation.isError && (
                <div className="text-destructive text-sm text-center">
                  Refund failed. Please try again.
                </div>
              )}

              {/* Refund Success Message */}
              {refundMutation.isSuccess && (
                <div className="text-primary text-sm text-center">
                  Refund processed successfully!
                </div>
              )}
            </div>
          ) : null}

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              variant="outline"
              onClick={() => setNotesModalOpen(true)}
              disabled={!customerId}
              className="relative"
            >
              Notes
              {hasNotes && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              )}
            </Button>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notes Modal */}
      <NotesModal
        customerId={customerId}
        open={notesModalOpen}
        onOpenChange={setNotesModalOpen}
      />
    </>
  );
}
