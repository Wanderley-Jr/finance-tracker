import TransactionHistory from "./TransactionHistory";
import TransactionCalendar from "./TransactionCalendar";
import { useTransactions } from "../transactionHooks";

export default function Transactions() {
    const { data } = useTransactions({})

    return (
        <div className="container-fluid my-4">
            <div className="row">
                <div className="col">
                    <TransactionCalendar transactions={data?.content ?? []} />
                </div>
                <div className="col-auto">
                    <TransactionHistory transactions={data?.content ?? []} />
                </div>
            </div>
        </div>
    );
}
