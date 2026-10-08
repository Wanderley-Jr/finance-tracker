import { useState, type ReactNode } from "react";
import Pagination from "../../components/Pagination";
import { deleteTransaction, type Transaction } from "./transactionService";
import EditTransactionModal from "./EditTransactionModal";
import { Modal, type ModalProps } from "react-bootstrap";

interface LastTransactionsWidgetProps {
    transactions: Transaction[]
    onEdit: () => void
}

export default function LastTransactionsWidget({ transactions, onEdit }: LastTransactionsWidgetProps) {
    const [pageIndex, setPageIndex] = useState(0);
    const tableRows = 10;

    return (
        <div className="card">
            <div className="card-body mx-2">
                <div className="row g-2">
                    <h5 className="col card-title me-4">
                        <i className="bi bi-wallet-fill me-2"></i>
                        Last transactions
                    </h5>

                    {transactions.length > 1 && (
                        <Pagination
                            className="col-auto"
                            pageIndex={pageIndex}
                            totalPages={Math.ceil(transactions.length / tableRows)}
                            maxVisiblePages={5}
                            onPageChange={(pageIndex: number) => {
                                setPageIndex(pageIndex);
                            }}
                        />
                    )}
                </div>

                <TransactionList 
                    transactions={transactions.slice(tableRows * pageIndex, tableRows * (pageIndex+1))}
                    emptyNode={<span className="text-secondary">No transactions found yet.</span>}
                    onEdit={onEdit}
                />
            </div>
        </div>
    );
}

interface TransactionListProps extends React.HTMLAttributes<HTMLTableElement> {
    transactions: Transaction[];
    emptyNode: ReactNode;
    onEdit: () => void;
}

export function TransactionList({ transactions, emptyNode, onEdit, ...props }: TransactionListProps) {
    const [editingId, setEditingId] = useState<number|null>(null)

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

                            <EditTransactionModal show={(editingId === transaction.id)} transaction={transaction} onEdit={onEdit} onHide={() => setEditingId(null)} />
                        </td>
                        <td className="px-1">
                            <button className="btn btn-danger">
                                <i className="bi bi-trash"></i>
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

interface DeleteTransactionModalProps extends ModalProps {
    transaction: Transaction
}

function DeleteTransactionModal({ transaction, ...props }: DeleteTransactionModalProps) {
    return (
        <Modal {...props}>
            <Modal.Header closeButton>
                <Modal.Title>Add transaction</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Modal.Dialog>Are you sure you want to delete this transaction?</Modal.Dialog>
            </Modal.Body>

            <Modal.Footer>
                <button onClick={() => deleteTransaction(transaction.id!)} className="col-auto btn btn-danger">
                    <i className="bi bi-plus-lg me-2"></i>
                    Delete Transaction
                </button>
            </Modal.Footer>

        </Modal>
    )
}
