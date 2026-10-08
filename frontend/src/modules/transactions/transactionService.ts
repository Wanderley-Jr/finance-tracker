import api from "../../app/api"

export type Transaction = {
    id?: number
    amount: number
    date: Date
    title: string
    description: string
}

type TransactionDto = Omit<Transaction, "date"> & { date: string }

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

export async function getTransactions() {
    const response = await api.get<TransactionDto[]>("/transactions")
    return response.data.map(fromDto)
}

export async function getTransaction(id: number) {
    const response = await api.get<TransactionDto>(`/transactions/${id}`)
    return fromDto(response.data)
}

export async function updateTransaction(id: number, transaction: Transaction) {
    await api.put(`/transactions/${id}`, toDto(transaction))
}

export async function deleteTransaction(id: number) {
    await api.delete(`/transactions/${id}`)
}