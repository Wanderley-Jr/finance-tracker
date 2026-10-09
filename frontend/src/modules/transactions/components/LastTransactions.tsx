import { useState } from "react";
import Pagination from "../../../components/Pagination";
import { type Transaction } from "../transactionService";
import TransactionList from "./TransactionList";

interface LastTransactionsProps {
    transactions: Transaction[]
    onTransactionsChanged: () => void
}

export default function LastTransactions({ transactions, onTransactionsChanged }: LastTransactionsProps) {
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
                    onTransactionsChanged={onTransactionsChanged}
                    showDate
                />
            </div>
        </div>
    );
}