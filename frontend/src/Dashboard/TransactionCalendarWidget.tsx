import { useState } from "react";
import { DayPicker } from "@daypicker/react";

import "@daypicker/react/style.css";
import { TransactionList } from "./LastTransactionsWidget";

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
    const [selectedDate, setSelected] = useState<Date>()

    return (
        <div className="card">
            <div className="card-body mx-2">
                <div className="row g-2">
                    <h5 className="col card-title">
                        <i className="bi bi-calendar-fill me-2"></i>
                        Last transactions
                    </h5>
                </div>

                <div className="row">
                    <DayPicker
                        className="col"
                        animate
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelected}
                    />

                    <TransactionList className="col" transactions={[{ amount: 60, date: "2026-03-12" }]}/>
                </div>
            </div>
        </div>
    );
}