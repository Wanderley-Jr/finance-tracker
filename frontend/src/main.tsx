import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./app/App.tsx";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={new QueryClient()}>
                <App />
            </QueryClientProvider>
        </BrowserRouter>
    </StrictMode>
);
