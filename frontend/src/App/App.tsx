import { Route, Routes } from "react-router-dom";

import NavBar from "./NavBar";
import SideBar from "./SideBar";

import Dashboard from "../modules/dashboard/Dashboard";

export default function App() {
    return (
        <>
            <NavBar />

            <div className="d-flex">
                <SideBar />

                <main className="container">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                    </Routes>
                </main>
            </div>
        </>
    );
}
