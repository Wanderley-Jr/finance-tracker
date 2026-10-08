import { useState } from "react";
import { DayPicker } from "@daypicker/react";

import "@daypicker/react/style.css";
import { TransactionList } from "./LastTransactionsWidget";
import CreateTransactionModal from "./CreateTransactionModal";
import { type Transaction } from "./transactionService";

interface TransactionCalendarWidgetProps {
    transactions: Transaction[]
    onCreate: () => void
}

export default function TransactionCalendarWidget({ onCreate, transactions }: TransactionCalendarWidgetProps) {
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelected] = useState<Date>();

    const handleOpen = () => setShowModal(true);
    const handleClose = () => setShowModal(false);

    return (
        <>
            <CreateTransactionModal date={selectedDate!} show={showModal} onHide={handleClose} onCreate={onCreate} />

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
                                onEdit={onCreate}
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
            </div>
        </>
    );
}
