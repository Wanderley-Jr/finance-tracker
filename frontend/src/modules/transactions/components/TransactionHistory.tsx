import { useState } from "react";
import { type Transaction } from "../transactionService";
import TransactionList from "./TransactionList";

interface TransactionHistoryProps {
    transactions: Transaction[]
    onTransactionsChanged: () => void
}

type TransactionSorts =
    | "date_asc"
    | "date_desc"
    | "amount_asc"
    | "amount_desc"
    | "title_asc"
    | "title_desc";

function getSorterFor(sort: TransactionSorts): (a: Transaction, b: Transaction) => number {
    switch (sort) {
        case "date_asc":
            return (a: Transaction, b: Transaction): number =>
                a.date.getTime() - b.date.getTime();

        case "date_desc":
            return (a: Transaction, b: Transaction): number =>
                b.date.getTime() - a.date.getTime();

        case "amount_asc":
            return (a: Transaction, b: Transaction): number =>
                a.amount - b.amount;

        case "amount_desc":
            return (a: Transaction, b: Transaction): number =>
                b.amount - a.amount;

        case "title_asc":
            return (a: Transaction, b: Transaction): number =>
                a.title.localeCompare(b.title);

        case "title_desc":
            return (a: Transaction, b: Transaction): number =>
                b.title.localeCompare(a.title);
    }
};

type LocalDate = string

export default function TransactionHistory({ transactions }: TransactionHistoryProps) {
    const [search, setSearch] = useState("")
    const [startDate, setStartDate] = useState<Date | null>(null)
    const [endDate, setEndDate] = useState<Date | null>(null)
    const [sortingBy, setSortingBy] = useState<TransactionSorts>("date_desc")
    const [titleOnly, setTitleOnly] = useState(false);
    const [pageIndex, setPageIndex] = useState(0);
    const tableRows = 10;

    const filteredTransactions = transactions
        .filter(it => {
            if (it.title.toLowerCase().includes(search.toLowerCase())) return true
            if (!titleOnly && it.description.toLowerCase().includes(search.toLowerCase())) return true
            return false
        })
        .filter(it => {
            if (startDate !== null && it.date < startDate) return false
            if (endDate !== null && it.date > endDate) return false
            return true
        })
        .toSorted(getSorterFor(sortingBy))

    return (
        <div className="card">
            <div className="card-header">
                <div className="row g-2 align-items-center">
                    <h5 className="col card-title my-2">
                        <i className="bi bi-wallet-fill me-2"></i>
                        Transaction History
                    </h5>
                </div>
            </div>

            <div className="card-body mx-2">
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

                <div className="row">
                    <div className="col input-group mb-3">
                        <span className="input-group-text">
                            From
                        </span>

                        <input
                            type="date"
                            className="form-control"
                            value={startDate?.toISOString().slice(0, 10) ?? undefined}
                            onChange={e => setStartDate(new Date(e.target.value + "T00:00:00"))}
                        />
                    </div>

                    <div className="col input-group mb-3">
                        <span className="input-group-text">
                            To
                        </span>

                        <input
                            type="date"
                            className="form-control"
                            value={endDate?.toISOString().slice(0, 10) ?? ""}
                            onChange={e => setEndDate(new Date(e.target.value + "T00:00:00"))}
                        />
                    </div>

                    <div className="col input-group mb-3">
                        <span className="input-group-text">
                            Sort By
                        </span>

                        <select
                            className="form-select"
                            value={sortingBy}
                            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                                setSortingBy(event.target.value as TransactionSorts)
                            }
                        >
                            <option value="date_desc">Date (newest first)</option>
                            <option value="date_asc">Date (oldest first)</option>
                            <option value="amount_desc">Amount (highest first)</option>
                            <option value="amount_asc">Amount (lowest first)</option>
                            <option value="title_asc">Title (A-Z)</option>
                            <option value="title_desc">Title (Z-A)</option>
                        </select>
                    </div>
                </div>

                <TransactionList
                    transactions={filteredTransactions}
                    emptyNode={<span className="text-secondary">No transactions found yet.</span>}
                    queryParams={{ title: search, startDate: new Date(), endDate: endDate }}
                    showDate        
                />
            </div>
        </div>
    );
}