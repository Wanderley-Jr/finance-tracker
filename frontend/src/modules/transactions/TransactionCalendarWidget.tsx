import { useState } from "react";
import { DayPicker } from "@daypicker/react";

import "@daypicker/react/style.css";
import { TransactionList } from "./LastTransactionsWidget";
import { Modal } from "react-bootstrap";
import CreateTransactionModal from "./CreateTransactionModal";

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

export default function TransactionCalendarWidget() {
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelected] = useState<Date>();

    const handleOpen = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    return (
        <>
            <CreateTransactionModal date={selectedDate!} show={showModal} onHide={handleClose} />

            <div className="card">
                <div className="card-body mx-2">
                    <div className="row g-2">
                        <h5 className="col card-title">
                            <i className="bi bi-calendar-fill me-2"></i>
                            Calendar
                        </h5>

                        <button
                            className={`col-auto btn btn-success ${selectedDate ? "" : "disabled"}`}
                            onClick={handleOpen}
                        >
                            <i className="bi bi-plus-lg me-2"></i>
                            Add transaction
                        </button>
                    </div>

                    <div className="row my-3">
                        <div className="col">
                            <DayPicker
                                animate
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelected}
                                modifiers={{ hasTransactions: [new Date(2026, 9, 6)] }}
                                modifiersClassNames={{
                                    hasTransactions: "bg-danger bg-opacity-50 rounded-circle",
                                }}
                            />
                        </div>

                        <div className="col">
                            <TransactionList
                                transactions={[]}
                                emptyNode={
                                    <span className="text-secondary">
                                        {selectedDate
                                            ? "No transactions for selected date"
                                            : "Select a date to view transactions made"}
                                    </span>
                                }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
