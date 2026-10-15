import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTransaction, deleteTransaction, getTransactions, updateTransaction, type Transaction, type TransactionQueryParams } from "./transactionService";

export function useTransactions(params: TransactionQueryParams) {
    return useQuery({
        queryKey: ["transactions", params],
        queryFn: () => getTransactions(params),
        placeholderData: keepPreviousData
    })
}

export function useCreateTransaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (transaction: Omit<Transaction, "id">) => createTransaction(transaction),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["transactions"] })
        }
    })
}

export function useUpdateTransaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (transaction: Transaction) => updateTransaction(transaction.id!, transaction),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["transactions"] })
        }
    })
}

export function useDeleteTransaction() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (transaction: Transaction) => deleteTransaction(transaction.id!),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ["transactions"] })
        }
    })
}