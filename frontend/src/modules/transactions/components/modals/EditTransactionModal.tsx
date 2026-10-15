import { Modal, type ModalProps } from "react-bootstrap";
import { updateTransaction, type Transaction } from "../../transactionService";
import TransactionForm from "./TransactionForm";

interface EditTransactionModalProps extends ModalProps {
    transaction: Transaction
    onEdit?: () => void
}

export default function EditTransactionModal({ transaction, onEdit, ...props }: EditTransactionModalProps) {
    const handleSubmit = (transaction: Transaction) => {
        console.log(transaction)
        updateTransaction(transaction.id!, transaction).then(onEdit)
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
