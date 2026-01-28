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

export const SubscriptionPlanSchema = v.picklist(["1", "3", "12"]);

export const ProviderSchema = v.picklist(["stripe", "macropay"]);

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
  // New fields
  email: v.optional(v.string()),
  subscription_plan: v.optional(SubscriptionPlanSchema),
  subscription_status: v.optional(v.string()),
  country: v.optional(v.string()),
  provider: v.optional(ProviderSchema),
  normalized_card_brand: v.optional(v.string()),
  card_holder_name: v.optional(v.string()),
  bin: v.optional(v.string()),
  last_4: v.optional(v.string()),
  next_transaction_date: v.optional(v.nullable(v.string())),
  refund_date: v.optional(v.nullable(v.string())),
  id_order: v.optional(v.string()),
});

export type Transaction = v.InferOutput<typeof TransactionSchema>;
export type TransactionStatus = v.InferOutput<typeof TransactionStatusSchema>;
export type TransactionType = v.InferOutput<typeof TransactionTypeSchema>;
export type PaymentType = v.InferOutput<typeof PaymentTypeSchema>;
export type SubscriptionPlan = v.InferOutput<typeof SubscriptionPlanSchema>;
export type Provider = v.InferOutput<typeof ProviderSchema>;
