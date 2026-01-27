import { useMutation, useQueryClient } from "@tanstack/react-query";
import { refundsApi, type RefundRequest } from "~/lib/api";

export function useRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RefundRequest) => refundsApi.create(data),
    onSuccess: (_data, variables) => {
      // Invalidate customer transactions to refresh the data
      queryClient.invalidateQueries({ queryKey: ["customer-transactions"] });
      // Also invalidate the transactions list
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}
