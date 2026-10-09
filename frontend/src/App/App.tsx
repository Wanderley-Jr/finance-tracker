import { Route, Routes } from "react-router-dom";

import NavBar from "./NavBar";
import SideBar from "./SideBar";

import Dashboard from "../modules/dashboard/Dashboard";
import Transactions from "../modules/transactions/components/Transactions";

export default function App() {
    return (
        <>
            <NavBar />
            <div className="container-fluid">
                <div className="row">
                    <SideBar />

                    <main className="col my-2">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/transactions" element={<Transactions />} />
                        </Routes>
                    </main>
                </div>
            </div>
        </>
    );
}
