import { Outlet } from "react-router-dom";

export default function AuthLayout() {
    return (
        <div className="container-fluid">
            <div className="row min-vh-100 align-items-center justify-content-center">
                <div className="col-12" style={{ maxWidth: "32rem" }}>
                    <Outlet />
                </div>
            </div>
        </div>
    );
}