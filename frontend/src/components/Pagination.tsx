interface PaginationProps extends React.HTMLAttributes<HTMLElement> {
    pageIndex: number
    totalPages: number
    maxVisiblePages: number
    onPageChange: (pageIndex: number) => void
}

export default function Pagination({ pageIndex, totalPages, maxVisiblePages, onPageChange, ...props }: PaginationProps) {
    return (
        <nav {...props}>
            <ul className="pagination pagination-sm">
                <li className="page-item">
                    <button
                        type="button"
                        aria-label="First page"
                        className={`page-link ${pageIndex == 0 ? "disabled" : ""}`}
                        disabled={pageIndex == 0}
                        onClick={() => onPageChange(0)}
                    >
                        <i className={`bi bi-chevron-double-left`}></i>
                    </button>
                </li>
                <li className="page-item">
                    <button
                        type="button"
                        aria-label="Previous page"
                        className={`page-link ${pageIndex == 0 ? "disabled" : ""}`}
                        disabled={pageIndex == 0}
                        onClick={() => onPageChange(Math.max(0, pageIndex - 1))}
                    >
                        <i className="bi bi-chevron-left"></i>
                    </button>
                </li>
                {Array.from({ length: Math.min(totalPages, maxVisiblePages) }).map((_, i) => {
                    const start = Math.min(
                        Math.max(0, Math.ceil(pageIndex - maxVisiblePages / 2)),
                        Math.max(0, totalPages - maxVisiblePages)
                    );

                    return (
                        <li
                            key={i}
                            className={`page-item ${start + i == pageIndex ? "active" : ""}`}
                            onClick={() => onPageChange(start + i)}
                        >
                            <button
                                type="button"
                                style={{ minWidth: "35px" }}
                                className="page-link"
                                aria-current={start + i == pageIndex ? "page" : undefined}
                            >
                                {start + i + 1}
                            </button>
                        </li>
                    );
                })}
                <li className="page-item">
                    <button
                        type="button"
                        aria-label="Next page"
                        className={`page-link ${pageIndex + 1 == totalPages ? "disabled" : ""}`}
                        disabled={pageIndex + 1 >= totalPages}
                        onClick={() => onPageChange(Math.min(pageIndex + 1, totalPages - 1))}
                    >
                        <i className={`bi bi-chevron-right`}></i>
                    </button>
                </li>
                <li className="page-item">
                    <button
                        type="button"
                        aria-label="Last page"
                        className={`page-link ${pageIndex + 1 == totalPages ? "disabled" : ""}`}
                        disabled={pageIndex + 1 >= totalPages}
                        onClick={() => onPageChange(totalPages - 1)}
                    >
                        <i className="bi bi-chevron-double-right"></i>
                    </button>
                </li>
            </ul>
        </nav>
    );
}
