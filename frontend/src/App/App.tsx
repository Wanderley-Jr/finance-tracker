
import { Navigate, Route, Routes } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import AuthLayout from "./components/AuthLayout";

import Dashboard from "../modules/dashboard/Dashboard";
import Transactions from "../modules/transactions/components/Transactions";
import ProtectedRoute from "../components/ProtectedRoute";
import RegisterPage from "../modules/auth/RegisterPage";
import LoginPage from "../modules/auth/LoginPage";

export default function App() {
    return (
        <Routes>
            {/* Public routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route
                        path="/transactions"
                        element={<Transactions />}
                    />
                </Route>
            </Route>

            {/* Unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

