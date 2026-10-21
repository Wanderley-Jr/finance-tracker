import BalanceChart from "./BalanceChart";
import CashPieGraph from "./CashPieGraph";
import MonthlyCashFlowChart from "./MonthlyCashFlowChart";

export default function Dashboard() {
    return (
        <div className="container my-4">
            <div className="row">
                <div className="col">
                    <MonthlyCashFlowChart />
                </div>
                <div className="col">
                    <CashPieGraph />
                </div>
            </div>
            <div className="row">
                <div className="col">
                    <BalanceChart />
                </div>
            </div>
        </div>
    );
}
