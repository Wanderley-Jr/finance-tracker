import MonthlyCashFlowChart from "./MonthlyCashFlowChart";

export default function Dashboard() {
    return (
        <div className="container my-4">
            <div className="row">
                <div className="col">
                    <MonthlyCashFlowChart />
                </div>
            </div>
        </div>
    );
}
