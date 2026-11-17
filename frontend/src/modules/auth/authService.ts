import api from "../../app/api";

export type User = {
    id: number;
    email: string;
};

export type Credentials = {
    email: string;
    password: string;
}

export async function register(credentials: Credentials): Promise<void> {
    await api.get("/csrf");
    
    await api.post("/auth/register", credentials);
}

export async function login(credentials: Credentials): Promise<void> {
    await api.get("/csrf");

    const body = new URLSearchParams();
    body.set("username", credentials.email);
    body.set("password", credentials.password);

    await api.post("/auth/login", body, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
    });

    await api.get("/csrf");
}

export async function getCurrentUser(): Promise<User> {
    const response = await api.get<User>("/auth/me");
    return response.data;
}

export async function logout(): Promise<void> {
    await api.post("/auth/logout");
}