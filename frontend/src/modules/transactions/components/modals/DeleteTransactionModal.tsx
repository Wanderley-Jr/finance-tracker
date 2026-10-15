import { Modal, type ModalProps } from "react-bootstrap";
import { deleteTransaction, type Transaction } from "../../transactionService";

interface DeleteTransactionModalProps extends ModalProps {
    transaction: Transaction
    onDelete?: () => void
}

export default function DeleteTransactionModal({ transaction, onDelete, ...props }: DeleteTransactionModalProps) {
    const onClick = () => {
        deleteTransaction(transaction.id!).then(onDelete)
        props.onHide?.();
    }

    return (
        <Modal {...props}>
            <Modal.Header closeButton>
                <Modal.Title>Delete transaction</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                Are you sure you want to delete this transaction?
            </Modal.Body>

            <Modal.Footer>
                <button onClick={() => onClick()} className="col-auto btn btn-danger">
                    <i className="bi bi-trash me-2"></i>
                    Delete Transaction
                </button>
            </Modal.Footer>
        </Modal>
    )
}