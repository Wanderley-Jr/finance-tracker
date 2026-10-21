import { useMemo } from "react"

interface MoneyAmountProps {
    amount: number
    hideSign?: boolean
}

export default function MoneyAmount({ amount, hideSign }: MoneyAmountProps) {
    const formatter = useMemo(() => (new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 2,
    })), [])

    return (
        <span className={"fw-semibold text-nowrap " + (amount > 0 ? "text-success" : "text-danger")}>
            {hideSign || (<span className="fw-bold col-auto p-0">{amount > 0 ? "+ " : "- "}</span>)}
            <span className="col-auto p-0">{formatter.format(Math.abs(amount))}</span>
        </span>
    )
}