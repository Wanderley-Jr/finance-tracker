import LastTransactionsWidget from "./LastTransactionsWidget";
import TransactionCalendarWidget from "./TransactionCalendarWidget";

export default function Transactions() {
    return (
        <div className="container my-4">
            <div className="row">
                <div className="col">
                    <TransactionCalendarWidget />
                </div>
                <div className="col-auto">
                    <LastTransactionsWidget />
                </div>
            </div>
        </div>
    );
}
