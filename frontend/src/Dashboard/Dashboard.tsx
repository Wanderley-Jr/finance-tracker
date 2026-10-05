import LastTransactionsWidget from "./LastTransactionsWidget";
import TransactionCalendarWidget from "./TransactionCalendarWidget";

export default function Dashboard() {
    return (
        <div className="container my-4">
            <div className="row">
                <div className="col-6">
                    <TransactionCalendarWidget />
                </div>
                <div className="col-auto">
                    <LastTransactionsWidget />
                </div>
            </div>
        </div>
    );
}

