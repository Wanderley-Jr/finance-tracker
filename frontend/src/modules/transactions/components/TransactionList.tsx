import { useState, type ReactNode } from "react";
import type { Transaction } from "../transactionService";
import EditTransactionModal from "./modals/EditTransactionModal";
import DeleteTransactionModal from "./modals/DeleteTransactionModal";

interface TransactionListProps extends React.HTMLAttributes<HTMLTableElement> {
    transactions: Transaction[];
    emptyNode: ReactNode;
    onTransactionsChanged: () => void;
}

export default function TransactionList({ transactions, emptyNode, onTransactionsChanged, ...props }: TransactionListProps) {
    const [editingId, setEditingId] = useState<number|null>(null)
    const [deletingId, setDeletingId] = useState<number|null>(null)

    return (
        <table className="table h-auto" {...props}>
            <colgroup>
                <col />
                <col />
                <col style={{ width: "1px" }} />
                <col style={{ width: "1px" }} />
            </colgroup>

            <thead>
                <tr>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Edit</th>
                    <th></th>
                </tr>
            </thead>

            <tbody>
                {transactions.length === 0 && (
                    <tr className="align-middle">
                        <td colSpan={4}>{emptyNode}</td>
                    </tr>
                )}
                {transactions.map((transaction) => (
                    <tr id={transaction.id!.toString()} className="align-middle">
                        <td className={`fw-bold ${transaction.amount >= 0 ? "text-success" : "text-danger"}`}>
                            <i className={`bi fs-6 ${transaction.amount > 0 ? "bi-plus" : "bi-dash"}`}></i>
                            R${String(transaction.amount).replace("-", "")}
                        </td>
                        <td>{transaction.date.toLocaleDateString()}</td>
                        <td className="px-1">
                            <button onClick={() => setEditingId(transaction.id!)} className="btn btn-primary">
                                <i className="bi bi-pencil"></i>
                            </button>

                            <EditTransactionModal show={editingId === transaction.id} transaction={transaction} onEdit={onTransactionsChanged} onHide={() => setEditingId(null)} />
                        </td>
                        <td className="px-1">
                            <button className="btn btn-danger" onClick={() => setDeletingId(transaction.id!)}>
                                <i className="bi bi-trash"></i>
                            </button>

                            <DeleteTransactionModal show={deletingId === transaction.id} transaction={transaction} onDelete={onTransactionsChanged}  onHide={() => setDeletingId(null)} />
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}