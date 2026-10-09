interface MoneyAmountProps {
    amount: number
    hideSign?: boolean
}

export default function MoneyAmount({amount, hideSign}: MoneyAmountProps) {
    return (
        <span className={"fw-semibold text-nowrap " + (amount > 0 ? "text-success" : "text-danger")}>
            {hideSign || (<span className="fw-bold col-auto p-0">{amount > 0 ? "+ " : "- "}</span>)}
            <span className="col-auto p-0">R${Math.abs(amount).toFixed(2)}</span>
        </span>
    )
}