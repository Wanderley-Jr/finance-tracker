import { Modal, type ModalProps } from "react-bootstrap";
import { type Transaction } from "../../transactionService";
import { useDeleteTransaction } from "../../transactionHooks";

interface DeleteTransactionModalProps extends ModalProps {
    transaction: Transaction
}

export default function DeleteTransactionModal({ transaction, ...props }: DeleteTransactionModalProps) {
    const deleteTransaction = useDeleteTransaction()

    const onClick = () => {
        deleteTransaction.mutate(transaction, {
            onSuccess: () => props.onHide?.(),
        })
    }

    return (
        <Modal {...props}>
            <Modal.Header closeButton>
                <Modal.Title>Delete transaction</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {deleteTransaction.isError && (
                    <div className="alert alert-danger" role="alert">
                        Could not delete the transaction. Please try again.
                    </div>
                )}

                Are you sure you want to delete this transaction?
            </Modal.Body>

            <Modal.Footer>
                <button
                    onClick={onClick}
                    className="col-auto btn btn-danger"
                    disabled={deleteTransaction.isPending}
                >
                    <i className="bi bi-trash me-2"></i>
                    Delete Transaction
                </button>
            </Modal.Footer>
        </Modal>
    )
}