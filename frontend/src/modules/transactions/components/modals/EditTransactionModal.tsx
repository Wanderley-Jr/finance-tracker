import { useState } from "react";

import { Modal, type ModalProps } from "react-bootstrap";
import { updateTransaction, type Transaction } from "../../transactionService";

interface EditTransactionModalProps extends ModalProps {
    transaction: Transaction
    onEdit: () => void
}

export default function EditTransactionModal({ transaction, onEdit, ...props }: EditTransactionModalProps) {
    const [amount, setAmount] = useState(transaction.amount.toString());
    const [date, setDate] = useState(transaction.date.toISOString().slice(0, 10));
    const [type, setType] = useState("EXPENSE");
    const [description, setDescription] = useState(transaction.description);

    const handleSubmit = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();

        const newTransaction: Transaction = {
            amount: Number(amount),
            description,
            date: new Date(date),
        };

        updateTransaction(transaction.id!, newTransaction).then(onEdit)

        props.onHide?.();
    };

    return (
        <Modal {...props}>
            <form onSubmit={handleSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>Add transaction</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <div className="row">
                        <div className="mb-3">
                            <label htmlFor="amount" className="form-label">
                                Amount
                            </label>

                            <input
                                type="number"
                                className="form-control"
                                id="amount"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="date" className="form-label">
                                Date
                            </label>

                            <input
                                type="date"
                                className="form-control"
                                id="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="type" className="form-label">
                                Type
                            </label>

                            <select
                                className="form-select"
                                id="type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="EXPENSE">Expense</option>
                                <option value="INCOME">Income</option>
                            </select>
                        </div>

                        <div className="mb-3">
                            <label htmlFor="description" className="form-label">
                                Description
                            </label>

                            <input
                                type="text"
                                className="form-control"
                                id="description"
                                placeholder="e.g. Groceries"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <button type="submit" className="col-auto btn btn-success">
                        <i className="bi bi-plus-lg me-2"></i>
                        Add transaction
                    </button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}
