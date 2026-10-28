
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useCurrentUser } from "../modules/auth/authHooks";

export default function ProtectedRoute() {
    const { data: user, isPending, isError } = useCurrentUser();
    const location = useLocation();

    if (isPending) {
        return (
            <div className="d-flex justify-content-center align-items-center min-vh-100">
                <span>Checking authentication...</span>
            </div>
        );
    }

    if (isError || !user) {
        return (
            <Navigate
                to="/login"
                state={{ from: location }}
                replace
            />
        );
    }

    return <Outlet />;
}
