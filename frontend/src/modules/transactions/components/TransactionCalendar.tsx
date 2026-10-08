import { useState } from "react";
import { DayPicker } from "@daypicker/react";

import "@daypicker/react/style.css";
import TransactionList from "./TransactionList";
import CreateTransactionModal from "./modals/CreateTransactionModal";
import { type Transaction } from "../transactionService";

interface TransactionCalendarWidgetProps {
    transactions: Transaction[]
    onTransactionsChanged: () => void
}

export default function TransactionCalendarWidget({ onTransactionsChanged, transactions }: TransactionCalendarWidgetProps) {
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelected] = useState<Date>();

    const handleOpen = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    return (
        <>
            <CreateTransactionModal date={selectedDate!} show={showModal} onHide={handleClose} onCreate={onTransactionsChanged} />

            <div className="card">
                <div className="card-header">
                    <div className="row g-2 align-items-baseline">
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
                </div>

                <div className="card-body mx-2">
                    <div className="row">
                        <div className="col-auto">
                            <DayPicker
                                animate
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelected}
                                modifiers={{
                                    hasTransactionsGreen: [transactions.filter(it => it.amount > 0).map(it => it.date)],
                                    hasTransactionsRed: [transactions.filter(it => it.amount < 0).map(it => it.date)]
                                }}
                                modifiersClassNames={{
                                    hasTransactionsGreen: "bg-success bg-opacity-50 rounded-circle",
                                    hasTransactionsRed: "bg-danger bg-opacity-50 rounded-circle",
                                }}
                            />
                        </div>

                        <div className="col">
                            <TransactionList
                                onTransactionsChanged={onTransactionsChanged}
                                transactions={transactions.filter(it => it.date.toLocaleDateString() == selectedDate?.toLocaleDateString())}
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

                <div className="card-footer">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <span className="fw-semibold">Compra de supermercado</span>
                            <small className="text-muted d-block">08/10/2026</small>
                        </div>

                        <span className="fw-semibold text-danger">
                            - R$ 127,50
                        </span>
                    </div>
                    <div className="">Foram realizadas compras no supermercado</div>
                </div>
            </div>
        </>
    );
}
