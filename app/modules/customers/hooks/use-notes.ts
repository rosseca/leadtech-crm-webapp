import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi, type CustomerNote, type CreateNoteRequest } from "~/lib/api";

export function useCustomerNotes(customerId: string | null) {
  return useQuery<CustomerNote[], Error>({
    queryKey: ["customer-notes", customerId],
    queryFn: () => notesApi.getByCustomerId(customerId!),
    enabled: !!customerId,
    staleTime: 1000 * 60, // 1 minute
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation<CustomerNote, Error, { customerId: string; data: CreateNoteRequest }>({
    mutationFn: ({ customerId, data }) => notesApi.create(customerId, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch notes for this customer
      queryClient.invalidateQueries({
        queryKey: ["customer-notes", variables.customerId],
      });
    },
  });
}
