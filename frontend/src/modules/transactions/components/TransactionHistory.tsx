import { useState } from "react";
import { type Transaction, type TransactionQueryParams } from "../transactionService";
import TransactionList from "./TransactionList";
import { parseLocalDate, type LocalDate } from "../../../app/localDate";

interface TransactionHistoryProps {
    transactions: Transaction[]
}

type SortOption = Exclude<TransactionQueryParams["sort"], undefined>[0] 

export default function TransactionHistory({ }: TransactionHistoryProps) {
    const [search, setSearch] = useState("")
    const [startDate, setStartDate] = useState<LocalDate | null>(null)
    const [endDate, setEndDate] = useState<LocalDate | null>(null)
    const [sortingBy, setSortingBy] = useState<SortOption>("date,desc")
    const [titleOnly, setTitleOnly] = useState(false);

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
                            value={startDate ?? undefined}
                            onChange={e => setStartDate(parseLocalDate(e.target.value))}
                        />
                    </div>

                    <div className="col input-group mb-3">
                        <span className="input-group-text">
                            To
                        </span>

                        <input
                            type="date"
                            className="form-control"
                            value={endDate ?? undefined}
                            onChange={e => setEndDate(parseLocalDate(e.target.value))}
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
                                setSortingBy(event.target.value as SortOption)
                            }
                        >
                            <option value="date,desc">Date (newest first)</option>
                            <option value="date,asc">Date (oldest first)</option>
                            <option value="amount,desc">Amount (highest first)</option>
                            <option value="amount,asc">Amount (lowest first)</option>
                            <option value="title,asc">Title (A-Z)</option>
                            <option value="title,desc">Title (Z-A)</option>
                        </select>
                    </div>
                </div>

                <TransactionList
                    emptyNode={<span className="text-secondary">No transactions found yet.</span>}
                    queryParams={{ title: search, startDate: startDate ?? undefined, endDate: endDate ?? undefined, sort: [sortingBy] }}
                    showDate        
                />
            </div>
        </div>
    );
}