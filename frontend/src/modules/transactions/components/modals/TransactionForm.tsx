import { useEffect, useState, type ComponentProps } from "react"
import type { Transaction } from "../../transactionService"

interface TransactionFormProps extends Omit<ComponentProps<"form">, "onSubmit"> {
    initialData?: Transaction
    onSubmit: (transaction: Transaction) => void
    overrideDate?: Date
}

export default function TransactionForm({ initialData, onSubmit, overrideDate, ...props }: TransactionFormProps) {
    const [amount, setAmount] = useState("");
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");

    useEffect(() => {
        setAmount(initialData?.amount.toFixed(2) ?? "")
        setTitle(initialData?.title ?? "")
        setDescription(initialData?.description ?? "")
        setDate(initialData?.date?.toISOString()?.slice(0, 10) ?? "")
    }, [initialData])

    return (
        <form {...props} onSubmit={(e) => {
            e.preventDefault()

            const transaction: Transaction = {
                id: initialData?.id,
                amount: Number(amount),
                title,
                description,
                date: overrideDate ?? new Date(date),
            };

            onSubmit(transaction)
        }}>
            <div className="row">
                <div className="mb-3">
                    <label htmlFor="amount" className="form-label">
                        Amount
                    </label>

                    <input
                        type="number"
                        className="form-control"
                        id="amount"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        required
                        min={0}
                        step={0.01}
                    />
                </div>

                {overrideDate === undefined && (
                    <div className="mb-3">
                        <label htmlFor="date" className="form-label">
                            Date
                        </label>

                        <input
                            type="date"
                            className="form-control"
                            id="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                )}

                <div className="mb-3">
                    <label htmlFor="title" className="form-label">
                        Title
                    </label>

                    <input
                        type="text"
                        className="form-control"
                        id="title"
                        placeholder="e.g. Groceries"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        minLength={3}
                        maxLength={30}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="description" className="form-label">
                        Description
                    </label>

                    <textarea
                        className="form-control"
                        id="description"
                        rows={3}
                        placeholder="e.g. I went to the grocery store and bought strawberries and lemons"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        minLength={0}
                        maxLength={300}
                    />
                </div>
            </div>
        </form>
    )
}