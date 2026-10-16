import { Modal, type ModalProps } from "react-bootstrap";
import { type Transaction } from "../../transactionService";
import TransactionForm from "./TransactionForm";
import { useUpdateTransaction } from "../../transactionHooks";

interface EditTransactionModalProps extends ModalProps {
    transaction: Transaction
}

export default function EditTransactionModal({ transaction, ...props }: EditTransactionModalProps) {
    const updateTransaction = useUpdateTransaction()

    const handleSubmit = (transaction: Transaction) => {
        updateTransaction.mutate(transaction)
        props.onHide?.();
    };

    return (
        <Modal {...props}>
            <Modal.Header closeButton>
                <Modal.Title>Edit transaction</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <TransactionForm id={`edit-transaction-form-${transaction.id!}`} initialData={transaction} onSubmit={handleSubmit} />
            </Modal.Body>

            <Modal.Footer>
                <button type="submit" form={`edit-transaction-form-${transaction.id!}`} className="col-auto btn btn-primary">
                    <i className="bi bi-pencil me-2"></i>
                    Edit transaction
                </button>
            </Modal.Footer>
        </Modal>
    );
}
