import { useEffect, useState, type ReactNode } from "react";
import type { Transaction, TransactionQueryParams } from "../transactionService";
import EditTransactionModal from "./modals/EditTransactionModal";
import DeleteTransactionModal from "./modals/DeleteTransactionModal";
import React from "react";
import MoneyAmount from "../../../components/MoneyAmount";
import Pagination from "../../../components/Pagination";
import { useTransactions } from "../transactionHooks";
import type { Page } from "../../../app/api";
import { toDate } from "../../../app/localDate";

interface TransactionListProps extends React.HTMLAttributes<HTMLDivElement> {
    queryParams: TransactionQueryParams;
    emptyNode: ReactNode;
    onTransactionPreview?: (transaction: Transaction | null) => void;
    showDate?: boolean;
}

export default function TransactionList({
    queryParams,
    emptyNode,
    showDate,
    onTransactionPreview,
    ...props
}: TransactionListProps) {
    const [pageIndex, setPageIndex] = useState<number>(0);
    const [tableRows, setTableRows] = useState<number>(10);
    const { data, error } = useTransactions({ page: pageIndex, size: tableRows, ...queryParams })

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

                {data !== undefined && data.totalElements > 0
                    ? <TransactionListBody page={data} showDate={showDate} onTransactionPreview={onTransactionPreview} />
                    : <tbody>
                        <tr className="align-middle">
                            <td colSpan={showDate ? 5 : 4}>
                                {data?.totalElements === 0 && emptyNode}
                                {error !== null && "An error occurred while loading transactions: " + error.message}
                            </td>
                        </tr>
                    </tbody>
                }
            </table>

            <div className="d-flex justify-content-between align-items-center mt-3">
                {queryParams.size === undefined ? (
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
                ) : <div className="d-flex align-items-center gap-2" />}

                {data !== undefined && data.totalPages > 1 && (
                    <Pagination
                        pageIndex={pageIndex}
                        totalPages={data.totalPages}
                        maxVisiblePages={5}
                        onPageChange={setPageIndex}
                    />
                )}
            </div>
        </div>
    );
}

type ActiveModal = { type: "edit" | "delete", transaction: Transaction }

type TransactionListBodyProps = { page: Page<Transaction>, showDate?: boolean, onTransactionPreview?: (transaction: Transaction | null) => void }

function TransactionListBody({ page, showDate, onTransactionPreview }: TransactionListBodyProps) {
    const [activeModal, setActiveModal] = useState<ActiveModal | null>(null)
    const [hoveredTransaction, setHoveredTransaction] = useState<Transaction | null>(null);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const previewedTransaction = hoveredTransaction ?? selectedTransaction

    useEffect(() => onTransactionPreview?.(previewedTransaction), [previewedTransaction, onTransactionPreview])

    return (<tbody>
        {page.content.map((transaction) => (
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
                    <td>{toDate(transaction.date).toLocaleDateString()}</td>
                )}

                <td className="px-1">
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            setActiveModal({ type: "edit", transaction })
                        }}
                        className="btn btn-primary"
                    >
                        <i className="bi bi-pencil"></i>
                    </button>
                </td>

                <td className="px-1">
                    <button
                        className="btn btn-danger"
                        onClick={(e) => {
                            e.stopPropagation()
                            setActiveModal({ type: "delete", transaction })
                        }}
                    >
                        <i className="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        ))}

        {activeModal != null && (
            <EditTransactionModal
                show={activeModal.type === "edit"}
                transaction={activeModal.transaction}
                onHide={() => setActiveModal(null)}
            />
        )}

        {activeModal != null && (
            <DeleteTransactionModal
                show={activeModal.type === "delete"}
                transaction={activeModal.transaction}
                onHide={() => setActiveModal(null)}
            />
        )}
    </tbody>)
}