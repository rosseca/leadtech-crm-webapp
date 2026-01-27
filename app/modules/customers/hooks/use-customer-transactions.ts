import { useQuery } from "@tanstack/react-query";
import { customersApi } from "~/lib/api";

export function useCustomerTransactions(customerId: string | null) {
  return useQuery({
    queryKey: ["customer-transactions", customerId],
    queryFn: () => customersApi.getWithTransactions(customerId!),
    enabled: !!customerId,
  });
}
