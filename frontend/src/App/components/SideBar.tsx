import { NavLink } from "react-router-dom";

export default function SideBar() {
  return (
    <aside className="col-auto py-2 px-2 bg-body-secondary vh-100 border-end border-2">
        <nav className="nav nav-pills flex-column">
            <NavLink to="/" className="nav-link">
                <i className="bi bi-house-fill me-2"></i>
                Dashboard
            </NavLink>
            <NavLink to="/transactions" className="nav-link">
                <i className="bi bi-wallet-fill me-2"></i>
                Transactions
            </NavLink>
        </nav>
    </aside>
  )
}
