import { useMemo, useState } from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type { Transaction } from "../transactions/transactionService";
import { type LocalDate, parseLocalDate, toDate } from "../../app/localDate";
import { useTransactions } from "../transactions/transactionHooks";

function toLocalDateString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getMonthKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");

    return `${year}-${month}`;
}

function getMonthLabel(monthKey: string): string {
    const [year, month] = monthKey.split("-").map(Number);

    return new Date(year, month - 1, 1).toLocaleDateString("pt-BR", {
        month: "short",
        year: "2-digit",
    });
}

function getMonthlyCashFlow(
    transactions: Transaction[],
    startDate: string,
    endDate: string,
) {
    const [startYear, startMonth] = startDate.split("-").map(Number);
    const [endYear, endMonth] = endDate.split("-").map(Number);

    const monthlyData = new Map<
        string,
        { month: string; income: number; expenses: number }
    >();

    const currentMonth = new Date(startYear, startMonth - 1, 1);
    const lastMonth = new Date(endYear, endMonth - 1, 1);

    while (currentMonth <= lastMonth) {
        const monthKey = getMonthKey(currentMonth);

        monthlyData.set(monthKey, {
            month: getMonthLabel(monthKey),
            income: 0,
            expenses: 0,
        });

        currentMonth.setMonth(currentMonth.getMonth() + 1);
    }

    for (const transaction of transactions) {
        const monthKey = getMonthKey(toDate(transaction.date));
        const month = monthlyData.get(monthKey);

        if (!month) {
            continue;
        }

        if (transaction.amount > 0) {
            month.income += transaction.amount;
        } else if (transaction.amount < 0) {
            month.expenses += Math.abs(transaction.amount);
        }
    }

    return Array.from(monthlyData.values());
}

export default function MonthlyCashFlowChart() {
    const today = new Date();

    const defaultStartDate = toLocalDateString(
        new Date(today.getFullYear(), today.getMonth() - 11, 1),
    );

    const defaultEndDate = toLocalDateString(today);

    const [startDate, setStartDate] = useState<LocalDate>(defaultStartDate as LocalDate);
    const [endDate, setEndDate] = useState<LocalDate>(defaultEndDate as LocalDate);

    const invalidRange = startDate > endDate;

    const { data, isPending, isError } = useTransactions({
        startDate,
        endDate,
        page: 0,
        size: 1000,
    });

    const chartData = useMemo(
        () => getMonthlyCashFlow(
            data?.content ?? [],
            startDate,
            endDate,
        ),
        [data, startDate, endDate],
    );

    const currencyFormatter = useMemo(
        () =>
            new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
                maximumFractionDigits: 2,
            }),
        [],
    );

    return (
        <div className="card">
            <div className="card-header py-3">
                <div className="row">
                    <div className="col">
                        <h5 className="card-title mb-3">
                            Cash Flow
                        </h5>
                        <p className="text-body-secondary small mb-0">
                            Income vs. expenses across months
                        </p>
                    </div>

                    <div className="col">
                        <label
                            htmlFor="cash-flow-start-date"
                            className="form-label"
                        >
                            From
                        </label>

                        <input
                            id="cash-flow-start-date"
                            type="date"
                            className="form-control"
                            value={startDate}
                            max={endDate}
                            onChange={(event) => {
                                if (event.target.value) {
                                    setStartDate(parseLocalDate(event.target.value));
                                }
                            }}
                        />
                    </div>

                    <div className="col">
                        <label
                            htmlFor="cash-flow-end-date"
                            className="form-label"
                        >
                            To
                        </label>

                        <input
                            id="cash-flow-end-date"
                            type="date"
                            className="form-control"
                            value={endDate}
                            min={startDate}
                            max={defaultEndDate}
                            onChange={(event) => {
                                if (event.target.value) {
                                    setEndDate(parseLocalDate(event.target.value));
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            <div className="card-body">
                {invalidRange ? (
                    <p className="text-danger">
                        The start date must not be after the end date.
                    </p>
                ) : isPending ? (
                    <div
                        className="d-flex justify-content-center align-items-center"
                        style={{ height: 300 }}
                    >
                        <div
                            className="spinner-border text-primary"
                            role="status"
                        >
                            <span className="visually-hidden">
                                Loading...
                            </span>
                        </div>
                    </div>
                ) : isError ? (
                    <p className="text-danger">
                        Failed to load transactions.
                    </p>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                            data={chartData}
                            margin={{
                                top: 8,
                                right: 12,
                                left: 12,
                                bottom: 8,
                            }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis
                                dataKey="month"
                                tick={{ fontSize: 12 }}
                            />

                            <YAxis
                                width={100}
                                tickFormatter={(value: number) =>
                                    currencyFormatter.format(value)
                                }
                            />

                            <Tooltip
                                formatter={(value) =>
                                    currencyFormatter.format(Number(value))
                                }
                            />

                            <Legend />

                            <Bar
                                dataKey="income"
                                name="Income"
                                fill="#198754"
                                radius={[4, 4, 0, 0]}
                            />

                            <Bar
                                dataKey="expenses"
                                name="Expenses"
                                fill="#dc3545"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </div>
        </div>
    );
}