import {
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

import { useMemo } from "react";
import { useTransactions } from "../transactions/transactionHooks";

type BalancePoint = {
    date: string;
    balance: number;
    prediction?: number;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    month: "short",
    year: "2-digit",
});

export default function BalanceChart() {
    const { data, isPending, isError } = useTransactions({
        page: 0,
        size: 1000,
        sort: ["date,asc"],
    });

    const chartData = useMemo(() => {
        const transactions = [...(data?.content ?? [])].sort(
            (a, b) => a.date.localeCompare(b.date)
        );

        if (transactions.length === 0) {
            return [];
        }

        const monthlyChanges = new Map<string, number>();
        const dailyBalances = new Map<string, number>();

        let balance = 0;

        for (const transaction of transactions) {
            balance += transaction.amount;

            dailyBalances.set(transaction.date, balance);

            const month = transaction.date.slice(0, 7);
            monthlyChanges.set(
                month,
                (monthlyChanges.get(month) ?? 0) + transaction.amount
            );
        }

        const points: BalancePoint[] = Array.from(
            dailyBalances,
            ([date, balance]) => ({ date, balance })
        );

        const lastDate = new Date(
            `${transactions[transactions.length - 1].date}T12:00:00`
        );

        const months = Array.from(monthlyChanges.values());
        const averageMonthlyChange =
            months.reduce((sum, amount) => sum + amount, 0) /
            Math.max(months.length, 1);

        let projectedBalance = balance;

        // Anchor the forecast at the last recorded transaction.
        points[points.length - 1].prediction = balance;

        for (let i = 1; i <= 3; i++) {
            const forecastDate = new Date(lastDate);
            forecastDate.setMonth(forecastDate.getMonth() + i);

            projectedBalance += averageMonthlyChange;

            points.push({
                date: forecastDate.toISOString().slice(0, 10),
                balance: undefined as unknown as number,
                prediction: projectedBalance,
            });
        }

        // Connect the historical line to the forecast starting point.
        points[points.length - 1 - 3].prediction = balance;

        return points;
    }, [data]);

    const formatDate = (date: string) =>
        dateFormatter.format(new Date(`${date}T12:00:00`));

    return (
        <div className="card h-100">
            <div className="card-header py-3">
                <h5 className="card-title mb-1">Balance over time</h5>
                <p className="text-body-secondary small mb-0">
                    Historical balance and three-month projection
                </p>
            </div>

            <div className="card-body">
                {isPending ? (
                    <div className="d-flex justify-content-center align-items-center py-5">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                ) : isError ? (
                    <div className="alert alert-danger mb-0">
                        Failed to load transactions.
                    </div>
                ) : chartData.length === 0 ? (
                    <div className="text-body-secondary text-center py-5">
                        No transaction data available.
                    </div>
                ) : (
                    <>
                        <div
                            style={{ width: "100%", height: 300 }}
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart
                                    data={chartData}
                                    margin={{
                                        top: 10,
                                        right: 12,
                                        bottom: 5,
                                        left: 12,
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />

                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={formatDate}
                                        minTickGap={24}
                                        tick={{ fontSize: 12 }}
                                    />

                                    <YAxis
                                        tickFormatter={(value: number) =>
                                            currencyFormatter.format(value)
                                        }
                                        width={85}
                                        tick={{ fontSize: 12 }}
                                    />

                                    <Tooltip
                                        labelFormatter={(label) =>
                                            formatDate(String(label))
                                        }
                                        formatter={(value, name) => [
                                            currencyFormatter.format(Number(value)),
                                            name === "balance"
                                                ? "Balance"
                                                : "Projected balance",
                                        ]}
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="balance"
                                        name="Balance"
                                        stroke="#0d6efd"
                                        strokeWidth={2}
                                        dot={false}
                                        connectNulls
                                    />

                                    <Line
                                        type="monotone"
                                        dataKey="prediction"
                                        name="Projected balance"
                                        stroke="#fd7e14"
                                        strokeWidth={2}
                                        strokeDasharray="6 4"
                                        dot={false}
                                        connectNulls
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="d-flex justify-content-center gap-4 small mt-2">
                            <span>
                                <span
                                    className="d-inline-block me-2"
                                    style={{
                                        width: 18,
                                        borderTop: "2px solid #0d6efd",
                                        verticalAlign: "middle",
                                    }}
                                />
                                Historical
                            </span>

                            <span>
                                <span
                                    className="d-inline-block me-2"
                                    style={{
                                        width: 18,
                                        borderTop: "2px dashed #fd7e14",
                                        verticalAlign: "middle",
                                    }}
                                />
                                Forecast
                            </span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}