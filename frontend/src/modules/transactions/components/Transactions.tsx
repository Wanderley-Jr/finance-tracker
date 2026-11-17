import TransactionHistory from "./TransactionHistory";
import TransactionCalendar from "./TransactionCalendar";
import { useTransactions } from "../transactionHooks";

// The calendar aggregates on the client, so it needs more than the default
// page of 20 transactions. Ask for a large page so monthly totals and day
// highlights include the whole month (the backend's default max page size is
// 2000).
const CALENDAR_PAGE_SIZE = 1000;

export default function Transactions() {
    const { data } = useTransactions({ page: 0, size: CALENDAR_PAGE_SIZE })

    return (
        <div className="container-fluid my-4">
            <div className="row">
                <div className="col">
                    <TransactionCalendar transactions={data?.content ?? []} />
                </div>
                <div className="col-auto">
                    <TransactionHistory />
                </div>
            </div>
        </div>
    );
}
