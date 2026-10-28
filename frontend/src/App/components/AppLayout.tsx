
import { Outlet } from "react-router-dom";

import NavBar from "./NavBar";
import SideBar from "./SideBar";

export default function AppLayout() {
    return (
        <>
            <NavBar />

            <div className="container-fluid">
                <div className="row">
                    <SideBar />

                    <main className="col my-2">
                        <Outlet />
                    </main>
                </div>
            </div>
        </>
    );
}
