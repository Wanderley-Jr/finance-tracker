import { useEffect, useState } from "react";
import LastTransactionsWidget from "./LastTransactionsWidget";
import TransactionCalendarWidget from "./TransactionCalendarWidget";
import { getTransactions, type Transaction } from "./transactionService";

export default function Transactions() {
    const [transactions, setTransactions] = useState<Transaction[]>([])

    const fetchTransactions = () => {
        getTransactions().then(result => setTransactions(result))
    }

    useEffect(() => {
        fetchTransactions()
    }, [])

    return (
        <div className="container my-4">
            <div className="row">
                <div className="col">
                    <TransactionCalendarWidget transactions={transactions} onCreate={fetchTransactions} />
                </div>
                <div className="col-auto">
                    <LastTransactionsWidget transactions={transactions} onEdit={fetchTransactions} />
                </div>
            </div>
        </div>
    );
}
