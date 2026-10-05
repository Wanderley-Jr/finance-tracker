import { useState } from "react";
import Pagination from "./Pagination";

const transactions = [
        { amount: 500, date: "2026-10-03" },
        { amount: -500, date: "2026-10-03" },
        { amount: 500, date: "2026-10-03" },
        { amount: 500, date: "2026-10-02" },
        { amount: -500, date: "2026-10-01" },
        { amount: 500, date: "2026-09-03" },
        { amount: 500, date: "2026-10-03" },
        { amount: -500, date: "2026-10-03" },
        { amount: 500, date: "2026-10-03" },
        { amount: 500, date: "2026-10-02" },
        { amount: -500, date: "2026-10-01" },
        { amount: 500, date: "2026-09-03" },
        { amount: 500, date: "2026-10-03" },
        { amount: -500, date: "2026-10-03" },
        { amount: 500, date: "2026-10-03" },
        { amount: 500, date: "2026-10-02" },
        { amount: -500, date: "2026-10-01" },
        { amount: 500, date: "2026-09-03" },
        { amount: 500, date: "2026-10-03" },
        { amount: -500, date: "2026-10-03" },
        { amount: 500, date: "2026-10-03" },
        { amount: 500, date: "2026-10-02" },
        { amount: -500, date: "2026-10-01" },
        { amount: 500, date: "2026-09-03" },
        { amount: 500, date: "2026-10-03" },
        { amount: -500, date: "2026-10-03" },
        { amount: 500, date: "2026-10-03" },
        { amount: 500, date: "2026-10-02" },
        { amount: -500, date: "2026-10-01" },
        { amount: 500, date: "2026-09-03" },
        { amount: 500, date: "2026-10-03" },
        { amount: -500, date: "2026-10-03" },
        { amount: 500, date: "2026-10-03" },
        { amount: 500, date: "2026-10-02" },
        { amount: -500, date: "2026-10-01" },
        { amount: 500, date: "2026-09-03" },
    ];

export default function LastTransactionsWidget() {
    const [pageIndex, setPageIndex] = useState(0)
    const tableRows = 10

    return (
        <div className="card">
            <div className="card-body mx-2">
                <div className="row g-2">
                    <h5 className="col card-title">
                        <i className="bi bi-wallet-fill me-2"></i>
                        Last transactions
                    </h5>

                    {transactions.length > 1 && (
                        <Pagination className="col-auto"
                            pageIndex={pageIndex}
                            totalPages={Math.ceil(transactions.length / tableRows)}
                            maxVisiblePages={5}
                            onPageChange={(pageIndex: number) => {
                                setPageIndex(pageIndex);
                            }}
                        />
                    )}
                </div>

                <TransactionList transactions={transactions.slice(pageIndex*tableRows, (pageIndex+1)*tableRows)} />
            </div>
        </div>
    );
}

interface Transaction {
    amount: number
    date: string
}

interface TransactionListProps extends React.HTMLAttributes<HTMLTableElement> {
    transactions: Transaction[]
}

export function TransactionList({ transactions, ...props }: TransactionListProps) {
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
                {transactions.map((transaction) => (
                    <tr className="align-middle">
                        <td className={`fw-bold ${transaction.amount >= 0 ? "text-success" : "text-danger"}`}>
                            <i className={`bi fs-6 ${transaction.amount > 0 ? "bi-plus" : "bi-dash"}`}></i>
                            R${String(transaction.amount).replace("-", "")}
                        </td>
                        <td>2026-10-03</td>
                        <td className="px-1">
                            <button className="btn btn-primary">
                                <i className="bi bi-pencil"></i>
                            </button>
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
    )
}