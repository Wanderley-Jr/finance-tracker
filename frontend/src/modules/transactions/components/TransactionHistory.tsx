import { useState } from "react";
import Pagination from "../../../components/Pagination";
import { type Transaction } from "../transactionService";
import TransactionList from "./TransactionList";

interface TransactionHistoryProps {
    transactions: Transaction[]
    onTransactionsChanged: () => void
}

export default function TransactionHistory({ onTransactionsChanged, transactions }: TransactionHistoryProps) {
    const [search, setSearch] = useState("")
    const [titleOnly, setTitleOnly] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);
    const tableRows = 10;

    const filteredTransactions = transactions.filter(it => {
        if (it.title.includes(search)) return true
        if (!titleOnly && it.description.includes(search)) return true
        return false
    })

    return (
        <div className="card">
            <div className="card-body mx-2">
                <div className="row g-2">
                    <h5 className="col card-title me-4">
                        <i className="bi bi-wallet-fill me-2"></i>
                        Last transactions
                    </h5>

                    {filteredTransactions.length > 1 && (
                        <Pagination
                            className="col-auto"
                            pageIndex={pageIndex}
                            totalPages={Math.ceil(filteredTransactions.length / tableRows)}
                            maxVisiblePages={5}
                            onPageChange={(pageIndex: number) => {
                                setPageIndex(pageIndex);
                            }}
                        />
                    )}
                </div>

                <div className="input-group mb-3">
                    <span className="input-group-text">
                        <i className="bi bi-search"></i>
                    </span>

                    <input
                        type="search"
                        className="form-control"
                        placeholder="Search transactions..."
                        value={search}
                        onChange={e => {
                            setSearch(e.target.value);
                            setPageIndex(0);
                        }}
                    />

                    <label className="input-group-text gap-2">
                        <span>Title only</span>
                        <span className="form-check form-switch mb-0">
                            <input
                                className="form-check-input"
                                type="checkbox"
                                role="switch"
                                checked={titleOnly}
                                onChange={e => {
                                    setTitleOnly(e.target.checked);
                                    setPageIndex(0);
                                }}
                            />
                        </span>
                    </label>
                </div>

                <TransactionList
                    transactions={filteredTransactions.slice(tableRows * pageIndex, tableRows * (pageIndex + 1))}
                    emptyNode={<span className="text-secondary">No transactions found yet.</span>}
                    onTransactionsChanged={onTransactionsChanged}
                    showDate
                />
            </div>
        </div>
    );
}