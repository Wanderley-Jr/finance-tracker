import { useEffect, useState, type ReactNode } from "react";
import type { Transaction } from "../transactionService";
import EditTransactionModal from "./modals/EditTransactionModal";
import DeleteTransactionModal from "./modals/DeleteTransactionModal";
import React from "react";
import MoneyAmount from "./MoneyAmount";

interface TransactionListProps extends React.HTMLAttributes<HTMLTableElement> {
    transactions: Transaction[];
    emptyNode: ReactNode;
    onTransactionsChanged: () => void;
    onTransactionPeek?: (transaction: Transaction|null) => void;
    showDate?: boolean
}

export default function TransactionList({ transactions, emptyNode, showDate, onTransactionsChanged, onTransactionPeek, ...props }: TransactionListProps) {
    const [editingId, setEditingId] = useState<number|null>(null)
    const [deletingId, setDeletingId] = useState<number|null>(null)
    const [hoveredTransaction, setHoveredTransaction] = useState<Transaction|null>(null)
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction|null>(null)

    const editTransaction = (e: React.MouseEvent<HTMLButtonElement>, transaction: Transaction) => {
        e.stopPropagation()

        setEditingId(transaction.id!)
    }

    const deleteTransaction = (e: React.MouseEvent<HTMLButtonElement>, transaction: Transaction) => {
        e.stopPropagation()

        setDeletingId(transaction.id!)
    }

    useEffect(() => {
        if (hoveredTransaction !== null) {
            onTransactionPeek?.(hoveredTransaction)
        } else if (selectedTransaction !== null) {
            onTransactionPeek?.(selectedTransaction)
        }
        else {
            onTransactionPeek?.(null)
        }
    }, [hoveredTransaction, selectedTransaction])

    return (
        <table className="table h-auto" {...props}>
            <colgroup>
                <col />
                <col />
                {showDate && <col />}
                <col style={{ width: "1px" }} />
                <col style={{ width: "1px" }} />
            </colgroup>

            <thead>
                <tr>
                    <th>Amount</th>
                    <th>Title</th>
                    {showDate && <th>Date</th>}
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
                    <tr 
                        key={transaction.id!.toString()} 
                        className={"align-middle " + (selectedTransaction?.id === transaction.id && "table-primary")} 
                        onMouseEnter={() => {
                            setHoveredTransaction(transaction)
                        }}
                        onMouseLeave={() =>{
                            setHoveredTransaction(null)
                        }}
                        onClick={() => {
                            setSelectedTransaction(current => current === null ? transaction : null)
                        }}
                    >
                        <td>
                            <MoneyAmount amount={transaction.amount} />
                        </td>
                        <td>{transaction.title}</td>
                        {showDate && <td>{transaction.date.toLocaleDateString()}</td>}
                        <td className="px-1">
                            <button onClick={(e) => editTransaction(e, transaction)} className="btn btn-primary">
                                <i className="bi bi-pencil"></i>
                            </button>
                            
                            <EditTransactionModal show={editingId === transaction.id} transaction={transaction} onEdit={onTransactionsChanged} onHide={() => setEditingId(null)} />
                        </td>
                        <td className="px-1">
                            <button className="btn btn-danger" onClick={(e) => deleteTransaction(e, transaction)}>
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