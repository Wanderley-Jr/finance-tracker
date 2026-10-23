import { useState } from "react";
import { DayPicker } from "@daypicker/react";

import "@daypicker/react/style.css";
import TransactionList from "./TransactionList";
import CreateTransactionModal from "./modals/CreateTransactionModal";
import { type Transaction } from "../transactionService";
import MoneyAmount from "../../../components/MoneyAmount";
import { parseLocalDate, toDate, type LocalDate } from "../../../app/localDate";

interface TransactionCalendarWidgetProps {
    transactions: Transaction[]
}

function toMonth(dateStr: LocalDate): LocalDate {
    const date = toDate(dateStr)
    date.setDate(1)
    return parseLocalDate(date)
}

function nextMonth(dateStr: LocalDate): LocalDate {
    const date = toDate(dateStr)
    date.setDate(1)
    date.setMonth(date.getMonth() + 1)
    return parseLocalDate(date)
}

export default function TransactionCalendarWidget({ transactions }: TransactionCalendarWidgetProps) {
    const [showModal, setShowModal] = useState(false)
    const [selectedDate, setSelected] = useState<LocalDate>()
    const [selectedMonth, setSelectedMonth] = useState<LocalDate>(toMonth(parseLocalDate()))
    const [peekedTransaction, setPreviewedTransaction] = useState<Transaction | null>(null)

    const monthlyTransactions = transactions.filter(it => toDate(it.date).getMonth() === toDate(selectedMonth).getMonth()).map(it => it.amount)
    const income = monthlyTransactions.filter(it => it > 0).reduce((prev, cur) => prev+cur, 0)
    const expenses = monthlyTransactions.filter(it => it < 0).reduce((prev, cur) => prev+cur, 0)

    const handleOpen = () => setShowModal(true);
    const handleClose = () => setShowModal(false); 

    return (
        <>
            <CreateTransactionModal date={selectedDate!} show={showModal} onHide={handleClose} />

            <div className="card">
                <div className="card-header">
                    <div className="row g-2 align-items-baseline">
                        <h5 className="col card-title mt-2">
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
                                selected={selectedDate ? toDate(selectedDate) : undefined}
                                onSelect={(date) => setSelected(parseLocalDate(date))}
                                onMonthChange={(month) => setSelectedMonth(parseLocalDate(month))}
                                modifiers={{
                                    hasTransactionsGreen: [transactions.filter(it => it.amount > 0).map(it => toDate(it.date))],
                                    hasTransactionsRed: [transactions.filter(it => it.amount < 0).map(it => toDate(it.date))]
                                }}
                                modifiersClassNames={{
                                    hasTransactionsGreen: "bg-success bg-opacity-50 rounded-circle",
                                    hasTransactionsRed: "bg-danger bg-opacity-50 rounded-circle",
                                }}
                            />
                        </div>

                        <div className="col">
                            <TransactionList
                                queryParams={{ startDate: selectedDate, endDate: selectedDate, size: 5 }}
                                emptyNode={
                                    <span className="text-secondary">
                                        {selectedDate
                                            ? "No transactions for selected date"
                                            : "Select a date to view transactions made"}
                                    </span>
                                }
                                onTransactionPreview={setPreviewedTransaction}
                            />
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    {peekedTransaction === null && (
                        <div className="row text-center g-3">
                            <div className="col-4">
                                <small className="text-body-secondary d-block">Income</small>
                                <MoneyAmount amount={income} hideSign />
                            </div>

                            <div className="col-4 border-start border-end">
                                <small className="text-body-secondary d-block">Expenses</small>
                                <MoneyAmount amount={expenses} hideSign />
                                
                            </div>

                            <div className="col-4">
                                <small className="text-body-secondary d-block">Balance</small>
                                <MoneyAmount amount={income+expenses} />
                            </div>
                        </div>
                    )}
                    {peekedTransaction != null && (<>
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <span className="fw-semibold">{peekedTransaction.title}</span>
                                <small className="text-muted d-block">{toDate(peekedTransaction.date).toLocaleDateString()}</small>
                            </div>

                            <MoneyAmount amount={peekedTransaction.amount} />
                        </div>
                        <div style={{ whiteSpace: "pre-line" }}>{peekedTransaction.description}</div>
                    </>)}
                </div>
            </div>
        </>
    );
}
