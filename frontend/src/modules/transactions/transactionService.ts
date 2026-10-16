import api, { type Pagination, type Page } from "../../app/api"
import type { LocalDate } from "../../app/localDate"

export type Transaction = {
    id?: number
    amount: number
    date: LocalDate
    title: string
    description: string
}

export type TransactionQueryParams = Pagination<Transaction> & {
    startDate?: LocalDate
    endDate?: LocalDate
    title?: string
    description?: string
}

export async function createTransaction(transaction: Transaction) {
    await api.post("/transactions", transaction)
}

export async function getTransactions(params: TransactionQueryParams = {}) {
    const response = await api.get<Page<Transaction>>("/transactions", { params })
    return response.data
}

export async function getTransactionById(id: number) {
    const response = await api.get<Transaction>(`/transactions/${id}`)
    return response.data
}

export async function updateTransaction(id: number, transaction: Transaction) {
    return await api.put(`/transactions/${id}`, transaction)
}

export async function deleteTransaction(id: number) {
    return await api.delete(`/transactions/${id}`)
}