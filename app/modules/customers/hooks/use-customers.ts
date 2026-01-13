import { useQuery } from "@tanstack/react-query";
import { customersApi, type CustomersListParams } from "~/lib/api";

export function useCustomers(params: CustomersListParams = {}) {
  return useQuery({
    queryKey: ["customers", params],
    queryFn: () => customersApi.getList(params),
  });
}

export function useCustomer(id: string) {
  return useQuery({
    queryKey: ["customer", id],
    queryFn: () => customersApi.getById(id),
    enabled: !!id,
  });
}
