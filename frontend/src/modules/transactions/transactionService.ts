import api, { type Pagination, type Page } from "../../app/api"

export type Transaction = {
    id?: number
    amount: number
    date: Date
    title: string
    description: string
}

type TransactionDto = Omit<Transaction, "date"> & { date: string }

type TransactionFilter = {
    startDate?: string
    endDate?: string
    title?: string
    description?: string
}

function toDto(transaction: Transaction): TransactionDto {
    return {
        ...transaction,
        date: transaction.date.toISOString()
    }
}

function fromDto(dto: TransactionDto): Transaction {
    return {
        ...dto,
        date: new Date(dto.date + "T00:00:00")
    }
}

export async function createTransaction(transaction: Transaction) {
    await api.post("/transactions", toDto(transaction))
}

export async function getTransactions(params: Pagination<Transaction> & TransactionFilter = {}) {
    const response = await api.get<Page<TransactionDto>>("/transactions", { params })
    return response.data.content.map(fromDto)
}

export async function getTransactionById(id: number) {
    const response = await api.get<TransactionDto>(`/transactions/${id}`)
    return fromDto(response.data)
}

export async function updateTransaction(id: number, transaction: Transaction) {
    return await api.put(`/transactions/${id}`, toDto(transaction))
}

export async function deleteTransaction(id: number) {
    return await api.delete(`/transactions/${id}`)
}