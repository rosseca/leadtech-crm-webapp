import * as v from "valibot";

export const TransactionStatusSchema = v.picklist([
  "success",
  "failed",
  "in_process",
  "waiting_user_interaction",
]);

export const TransactionTypeSchema = v.picklist([
  "payment",
  "refund",
  "chargeback",
  "rdr",
]);

export const PaymentTypeSchema = v.picklist([
  "initial",
  "recurring",
  "upgrade",
]);

export const TransactionSchema = v.object({
  id: v.string(),
  id_transaction: v.string(),
  customer_id: v.string(),
  subscription_id: v.string(),
  amount: v.number(),
  currency: v.string(),
  payment_type: PaymentTypeSchema,
  transaction_type: TransactionTypeSchema,
  transaction_status: TransactionStatusSchema,
  payment_date: v.nullable(v.string()),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
});

export type Transaction = v.InferOutput<typeof TransactionSchema>;
export type TransactionStatus = v.InferOutput<typeof TransactionStatusSchema>;
export type TransactionType = v.InferOutput<typeof TransactionTypeSchema>;
export type PaymentType = v.InferOutput<typeof PaymentTypeSchema>;
