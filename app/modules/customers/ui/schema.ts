import * as v from "valibot";

export const LoginWithSchema = v.picklist([
  "Google",
  "Facebook",
  "Apple",
  "Email",
]);

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
});

export type Customer = v.InferOutput<typeof CustomerSchema>;
export type LoginWith = v.InferOutput<typeof LoginWithSchema>;
