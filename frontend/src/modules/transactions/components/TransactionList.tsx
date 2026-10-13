import { useEffect, useState, type ReactNode } from "react";
import type { Transaction } from "../transactionService";
import EditTransactionModal from "./modals/EditTransactionModal";
import DeleteTransactionModal from "./modals/DeleteTransactionModal";
import React from "react";
import MoneyAmount from "./MoneyAmount";
import Pagination from "../../../components/Pagination";

interface TransactionListProps extends React.HTMLAttributes<HTMLDivElement> {
    transactions: Transaction[];
    emptyNode: ReactNode;
    onTransactionsChanged: () => void;
    onTransactionPeek?: (transaction: Transaction | null) => void;
    showDate?: boolean;
    rowCount?: number;
}

export default function TransactionList({
    transactions,
    emptyNode,
    showDate,
    rowCount,
    onTransactionsChanged,
    onTransactionPeek,
    ...props
}: TransactionListProps) {
    const [editingId, setEditingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [hoveredTransaction, setHoveredTransaction] = useState<Transaction | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [pageIndex, setPageIndex] = useState<number>(0);
    const [tableRows, setTableRows] = useState<number>(10);

    const totalPages: number = Math.ceil(transactions.length / tableRows);

    const paginatedTransactions: Transaction[] = transactions.slice(
        pageIndex * tableRows,
        (pageIndex + 1) * tableRows
    );

    useEffect(() => {
        setPageIndex(0);
    }, [transactions]);

    useEffect(() => {
        setTableRows(rowCount ?? 10)
    }, [rowCount])

    const editTransaction = (
        e: React.MouseEvent<HTMLButtonElement>,
        transaction: Transaction
    ): void => {
        e.stopPropagation();
        setEditingId(transaction.id!);
    };

    const deleteTransaction = (
        e: React.MouseEvent<HTMLButtonElement>,
        transaction: Transaction
    ): void => {
        e.stopPropagation();
        setDeletingId(transaction.id!);
    };

    useEffect(() => {
        if (hoveredTransaction !== null) {
            onTransactionPeek?.(hoveredTransaction);
        } else if (selectedTransaction !== null) {
            onTransactionPeek?.(selectedTransaction);
        } else {
            onTransactionPeek?.(null);
        }
    }, [hoveredTransaction, selectedTransaction, onTransactionPeek]);

    return (
        <div {...props}>
            <table className="table h-auto mb-0">
                <colgroup>
                    <col style={{ width: "1px" }} />
                    <col />
                    {showDate && <col style={{ width: "1px" }} />}
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
                    {paginatedTransactions.length === 0 && (
                        <tr className="align-middle">
                            <td colSpan={showDate ? 5 : 4}>{emptyNode}</td>
                        </tr>
                    )}

                    {paginatedTransactions.map((transaction) => (
                        <tr
                            key={transaction.id!.toString()}
                            className={`align-middle ${selectedTransaction?.id === transaction.id
                                    ? "table-primary"
                                    : ""
                                }`}
                            onMouseEnter={() => setHoveredTransaction(transaction)}
                            onMouseLeave={() => setHoveredTransaction(null)}
                            onClick={() => {
                                setSelectedTransaction((current) =>
                                    current?.id === transaction.id ? null : transaction
                                );
                            }}
                        >
                            <td>
                                <MoneyAmount amount={transaction.amount} />
                            </td>

                            <td>{transaction.title}</td>

                            {showDate && (
                                <td>{transaction.date.toLocaleDateString()}</td>
                            )}

                            <td className="px-1">
                                <button
                                    onClick={(e) => editTransaction(e, transaction)}
                                    className="btn btn-primary"
                                >
                                    <i className="bi bi-pencil"></i>
                                </button>

                                <EditTransactionModal
                                    show={editingId === transaction.id}
                                    transaction={transaction}
                                    onEdit={onTransactionsChanged}
                                    onHide={() => setEditingId(null)}
                                />
                            </td>

                            <td className="px-1">
                                <button
                                    className="btn btn-danger"
                                    onClick={(e) => deleteTransaction(e, transaction)}
                                >
                                    <i className="bi bi-trash"></i>
                                </button>

                                <DeleteTransactionModal
                                    show={deletingId === transaction.id}
                                    transaction={transaction}
                                    onDelete={onTransactionsChanged}
                                    onHide={() => setDeletingId(null)}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="d-flex justify-content-between align-items-center mt-3">
                {rowCount === undefined ? (
                    <div className="d-flex align-items-center gap-2">
                        <label htmlFor="table-rows" className="text-nowrap">
                            Rows per page
                        </label>

                        <select
                            id="table-rows"
                            className="form-select form-select-sm"
                            value={tableRows}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                setTableRows(Number(e.target.value));
                                setPageIndex(0);
                            }}
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                        </select>
                    </div>
                ) : <div className="d-flex align-items-center gap-2"/>}

                {totalPages > 1 && (
                    <Pagination
                        pageIndex={pageIndex}
                        totalPages={totalPages}
                        maxVisiblePages={5}
                        onPageChange={setPageIndex}
                    />
                )}
            </div>
        </div>
    );
}