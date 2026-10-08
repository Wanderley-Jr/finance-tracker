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
    const [peekedTransaction, setPeekedTransaction] = useState<Transaction|null>(null)

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
                                onTransactionPeek={(transaction) => setPeekedTransaction(transaction)}
                            />
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    {peekedTransaction != null && (<>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <span className="fw-semibold">{ peekedTransaction.title }</span>
                                <small className="text-muted d-block">{ peekedTransaction.date.toLocaleDateString() }</small>
                            </div>

                            <span className={`fw-bold ${peekedTransaction.amount >= 0 ? "text-success" : "text-danger"}`}>
                                <i className={`bi fs-6 ${peekedTransaction.amount > 0 ? "bi-plus" : "bi-dash"}`}></i>
                                R${String(peekedTransaction.amount).replace("-", "")}
                            </span>
                        </div>
                        <div className="">{ peekedTransaction.description }</div>
                    </>)}
                </div>
            </div>
        </>
    );
}
