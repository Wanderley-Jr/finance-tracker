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
                        className={`page-link ${pageIndex == 0 ? "disabled" : ""}`}
                        onClick={() => onPageChange(0)}
                    >
                        <i className={`bi bi-chevron-double-left`}></i>
                    </button>
                </li>
                <li className="page-item">
                    <button
                        className={`page-link ${pageIndex == 0 ? "disabled" : ""}`}
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
                            <button style={{ minWidth: "35px" }} className="page-link">
                                {start + i + 1}
                            </button>
                        </li>
                    );
                })}
                <li className="page-item">
                    <button
                        className={`page-link ${pageIndex + 1 == totalPages ? "disabled" : ""}`}
                        onClick={() => onPageChange(Math.min(pageIndex + 1, totalPages - 1))}
                    >
                        <i className={`bi bi-chevron-right`}></i>
                    </button>
                </li>
                <li className="page-item">
                    <button
                        className={`page-link ${pageIndex + 1 == totalPages ? "disabled" : ""}`}
                        onClick={() => onPageChange(totalPages - 1)}
                    >
                        <i className="bi bi-chevron-double-right"></i>
                    </button>
                </li>
            </ul>
        </nav>
    );
}
