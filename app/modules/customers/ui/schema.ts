import * as v from "valibot";

export const LoginWithSchema = v.picklist([
  "Google",
  "Facebook",
  "Apple",
  "Email",
]);

export const UserTypeSchema = v.picklist(["free", "pro"]);

export const SubscriptionStatusSchema = v.picklist([
  "Active",
  "Unsubscribed",
  "Paying",
  "Non renewal",
]);

export const SubscriptionTypeSchema = v.picklist(["1", "3", "12"]);

export const ProviderSchema = v.picklist(["stripe", "macropay"]);

export const CustomerSchema = v.object({
  id: v.string(),
  email: v.pipe(v.string(), v.email()),
  name: v.string(),
  email_verified: v.boolean(),
  loginWith: LoginWithSchema,
  company_name: v.optional(v.string()),
  address: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  postal_code: v.optional(v.string()),
  country: v.optional(v.nullable(v.string())),
  subscription_id: v.optional(v.string()),
  created_at: v.nullable(v.string()),
  updated_at: v.nullable(v.string()),
  // New fields
  customer_id_np: v.optional(v.string()),
  status: v.optional(v.string()),
  unsubscribed_date: v.optional(v.nullable(v.string())),
  renewal_date: v.optional(v.nullable(v.string())),
  retries: v.optional(v.number()),
  first_transaction_date: v.optional(v.nullable(v.string())),
  user_type: v.optional(UserTypeSchema),
  subscription_status: v.optional(SubscriptionStatusSchema),
  subscription_type: v.optional(SubscriptionTypeSchema),
  language_communication: v.optional(v.string()),
  language_registration: v.optional(v.string()),
  provider: v.optional(ProviderSchema),
});

export type Customer = v.InferOutput<typeof CustomerSchema>;
export type LoginWith = v.InferOutput<typeof LoginWithSchema>;
export type UserType = v.InferOutput<typeof UserTypeSchema>;
export type SubscriptionStatus = v.InferOutput<typeof SubscriptionStatusSchema>;
export type SubscriptionType = v.InferOutput<typeof SubscriptionTypeSchema>;
export type Provider = v.InferOutput<typeof ProviderSchema>;
