import { useEffect, useState } from "react";
import LastTransactions from "./LastTransactions";
import TransactionCalendar from "./TransactionCalendar";
import { getTransactions, type Transaction } from "../transactionService";

export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([])

    const fetchTransactions = () => {
        getTransactions().then(result => setTransactions(result))
    }

    useEffect(() => {
        fetchTransactions()
    }, [])

    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col">
                    <TransactionCalendar transactions={transactions} onTransactionsChanged={fetchTransactions} />
                </div>
                <div className="col-auto">
                    <LastTransactions transactions={transactions} onTransactionsChanged={fetchTransactions} />
                </div>
            </div>
        </div>
    );
}
