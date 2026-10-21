import {
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    Legend,
} from "recharts";

import { useTransactions } from "../transactions/transactionHooks";

export default function CashPieChart() {
    const { data, isPending, isError } = useTransactions({
        page: 0,
        size: 1000,
        sort: ["amount,asc"],
    });

    let expenses = 0;
    let income = 0;

    for (const { amount } of data?.content ?? []) {
        if (amount < 0) {
            expenses += Math.abs(amount);
        } else {
            income += amount;
        }
    }

    const chartData = [
        { name: "Income", value: income, fill: "#198754" },
        { name: "Expenses", value: expenses, fill: "#dc3545" },
    ].filter(({ value }) => value > 0);

    const currencyFormatter = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
    });

    return (
        <div className="card h-100">
            <div className="card-header py-3">
                <h5 className="card-title mb-1">Income distribution</h5>
                <p className="text-body-secondary small mb-0">
                    Income vs. expenses across transactions
                </p>
            </div>

            <div className="card-body d-flex flex-column">
                {isPending ? (
                    <div className="flex-grow-1 d-flex align-items-center justify-content-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="alert alert-danger mb-0" role="alert">
                        Failed to load transaction data.
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="flex-grow-1 d-flex align-items-center justify-content-center text-body-secondary py-5">
                        No transaction data available.
                    </div>
                ) : (
                    <>
                        <div className="row g-3 mb-3">
                            <div className="col-6">
                                <div className="border rounded p-3 h-100">
                                    <div className="small text-body-secondary">
                                        Income
                                    </div>
                                    <div className="fw-semibold text-success text-break">
                                        {currencyFormatter.format(income)}
                                    </div>
                                </div>
                            </div>

                            <div className="col-6">
                                <div className="border rounded p-3 h-100">
                                    <div className="small text-body-secondary">
                                        Expenses
                                    </div>
                                    <div className="fw-semibold text-danger text-break">
                                        {currencyFormatter.format(expenses)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div
                            className="flex-grow-1"
                            style={{ minHeight: 260 }}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius="52%"
                                        outerRadius="78%"
                                        paddingAngle={3}
                                        stroke="none"
                                    >
                                        {chartData.map((entry) => (
                                            <path
                                                key={entry.name}
                                                fill={entry.fill}
                                            />
                                        ))}
                                    </Pie>

                                    <Tooltip
                                        formatter={(value) =>
                                            currencyFormatter.format(Number(value))
                                        }
                                    />

                                    <Legend
                                        verticalAlign="bottom"
                                        iconType="circle"
                                        iconSize={8}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}