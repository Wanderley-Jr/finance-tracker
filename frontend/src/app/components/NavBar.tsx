
import { Link, useNavigate } from "react-router-dom";
import { useCurrentUser, useLogout } from "../../modules/auth/authHooks";

export default function NavBar() {
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();
    const logout = useLogout();

    async function handleLogout() {
        try {
            await logout.mutateAsync();
            navigate("/login", { replace: true });
        } catch {
            // Keep the user on the current page if logout fails.
        }
    }

    const email = user?.email ?? "My account";
    const initial = email.charAt(0).toUpperCase();

    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-primary border-bottom border-2">
            <div className="container-fluid">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img
                        src="/favicon.png"
                        alt=""
                        width="32"
                        height="32"
                        className="me-2"
                    />
                    Finance Tracker
                </Link>

                <div className="dropdown ms-auto">
                    <button
                        className="btn btn-primary dropdown-toggle d-flex align-items-center gap-2 border-0"
                        type="button"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <span
                            className="rounded-circle bg-white text-primary d-inline-flex align-items-center justify-content-center fw-bold"
                            style={{ width: "36px", height: "36px" }}
                        >
                            {initial}
                        </span>
                    </button>

                    <ul className="dropdown-menu dropdown-menu-end shadow border-0">
                        <li>
                            <div className="dropdown-header">
                                Signed in as
                                <div className="fw-semibold text-body text-truncate">
                                    {email}
                                </div>
                            </div>
                        </li>

                        <li>
                            <hr className="dropdown-divider" />
                        </li>

                        <li>
                            <Link className="dropdown-item py-2" to="/user">
                                <i className="bi bi-person me-2" />
                                My account
                            </Link>
                        </li>

                        <li>
                            <button
                                className="dropdown-item text-danger py-2"
                                type="button"
                                onClick={handleLogout}
                                disabled={logout.isPending}
                            >
                                <i className="bi bi-box-arrow-right me-2" />
                                {logout.isPending
                                    ? "Signing out..."
                                    : "Logout"}
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
}
