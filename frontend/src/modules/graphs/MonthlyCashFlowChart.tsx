import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';

export default function MonthlyCashFlowChart() {
    return (
        <BarChart>
            <CartesianGrid />
            <XAxis dataKey="month"/>
        </BarChart>
    )
}