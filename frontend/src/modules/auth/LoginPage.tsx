import { useState, type FormEvent } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login } from "./authService";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const from = location.state?.from?.pathname ?? "/";

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError(null);
        setIsSubmitting(true);

        try {
            await login({ email, password });
            navigate(from, { replace: true });
        } catch {
            setError("Invalid email or password.");
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <main className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-body-tertiary py-4">
            <section className="card border-0 shadow-sm w-100" >
                <div className="card-body p-4 p-md-5">
                    <header className="text-center mb-4">
                        <i className="bi bi-wallet2 text-success fs-1" aria-hidden="true" />
                        <h1 className="h3 fw-bold mt-3">Welcome back</h1>
                        <p className="text-secondary mb-0">
                            Sign in to manage your finances.
                        </p>
                    </header>

                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Email address
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="form-control form-control-lg"
                                autoComplete="email"
                                value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                required
                                autoFocus
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                className="form-control form-control-lg"
                                autoComplete="current-password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-success btn-lg w-100"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? "Signing in..." : "Sign in"}
                        </button>
                    </form>

                    <p className="text-center text-secondary mt-4 mb-0">
                        Don't have an account?{" "}
                        <Link to="/register" className="link-success text-decoration-none fw-semibold">
                            Create one
                        </Link>
                    </p>
                </div>
            </section>
        </main>
    );
}