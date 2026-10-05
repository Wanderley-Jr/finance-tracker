import React, { useState } from "react";

export default function Dashboard() {
    return (
        <div className="container my-4">
            <div className="row">
                <div className="col">
                    <p>Stuff goes here</p>
                </div>
                <div className="col">
                    <TransactionTable />
                </div>
            </div>
        </div>
    );
}

interface NavControlsProps extends React.HTMLAttributes<HTMLElement> {
    length: number;
    limit: number;
}

function TransactionTable() {
    const transactions = [
        { amount: 500, date: "2026-10-03" },
        { amount: -500, date: "2026-10-03" },
        { amount: 500, date: "2026-10-03" },
        { amount: 500, date: "2026-10-02" },
        { amount: -500, date: "2026-10-01" },
        { amount: 500, date: "2026-09-03" },
    ];

    return (
        <div className="card">
            <div className="card-body mx-2">
                <div className="row g-2">
                    <h5 className="col card-title">
                        <i className="bi bi-wallet-fill me-2"></i>
                        Last transactions
                    </h5>

                    <NavControls className="col" length={15} limit={5} />
                </div>

                <table className="table">
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
            </div>
        </div>
    );
}

function NavControls({ length, limit, ...props }: NavControlsProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    return (
        <nav {...props}>
            <ul className="pagination pagination-sm">
                <li className="page-item">
                    <button
                        className={`page-link ${currentIndex == 0 ? "disabled" : ""}`}
                        onClick={() => setCurrentIndex(0)}
                    >
                        <i className={`bi bi-chevron-double-left`}></i>
                    </button>
                </li>
                <li className="page-item">
                    <button
                        className={`page-link ${currentIndex == 0 ? "disabled" : ""}`}
                        onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>
                </li>
                {Array.from({ length: Math.min(length, limit) }).map((_, i) => {
                    const start = Math.min(
                        Math.max(0, Math.ceil(currentIndex - limit / 2)),
                        Math.max(0, length - limit)
                    );

                    return (
                        <li
                            key={i}
                            className={`page-item ${start + i == currentIndex ? "active" : ""}`}
                            onClick={() => setCurrentIndex(start + i)}
                        >
                            <button style={{ minWidth: "35px" }} className="page-link">
                                {start + i + 1}
                            </button>
                        </li>
                    );
                })}
                <li className="page-item">
                    <button
                        className={`page-link ${currentIndex + 1 == length ? "disabled" : ""}`}
                        onClick={() => setCurrentIndex(Math.min(currentIndex + 1, length - 1))}
                    >
                        <i className={`bi bi-chevron-right`}></i>
                    </button>
                </li>
                <li className="page-item">
                    <button
                        className={`page-link ${currentIndex + 1 == length ? "disabled" : ""}`}
                        onClick={() => setCurrentIndex(length - 1)}
                    >
                        <i className="bi bi-chevron-double-right"></i>
                    </button>
                </li>
            </ul>
        </nav>
    );
}
