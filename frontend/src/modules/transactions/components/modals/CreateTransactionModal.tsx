import { useEffect, useState } from "react";

import { Modal, type ModalProps } from "react-bootstrap";
import { createTransaction, type Transaction } from "../../transactionService";
import TransactionForm from "./TransactionForm";

interface CreateTransactionModalProps extends ModalProps {
    date: Date;
    onCreate: () => void
}

export default function CreateTransactionModal({ date, onCreate, ...props }: CreateTransactionModalProps) {
    const handleSubmit = (transaction: Transaction) => {
        createTransaction(transaction).then(onCreate)
        props.onHide?.();
    };

    return (
        <Modal {...props}>
                <Modal.Header closeButton>
                    <Modal.Title>Add transaction</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <TransactionForm id="create-transaction-form" onSubmit={handleSubmit} overrideDate={date} />
                </Modal.Body>

                <Modal.Footer>
                    <button type="submit" form="create-transaction-form" className="col-auto btn btn-success">
                        <i className="bi bi-plus-lg me-2"></i>
                        Add transaction
                    </button>
                </Modal.Footer>
        </Modal>
    );
}
