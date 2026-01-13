import { useQuery } from "@tanstack/react-query";
import { transactionsApi, type TransactionsListParams } from "~/lib/api";

export function useTransactions(params: TransactionsListParams = {}) {
  return useQuery({
    queryKey: ["transactions", params],
    queryFn: () => transactionsApi.getList(params),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ["transaction", id],
    queryFn: () => transactionsApi.getById(id),
    enabled: !!id,
  });
}
