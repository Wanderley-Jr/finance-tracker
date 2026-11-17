
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Alert,
    Button,
    Card,
    Form,
    Stack,
} from "react-bootstrap";

import { useRegister } from "./authHooks";

interface RegisterForm {
    email: string;
    password: string;
    confirmPassword: string;
}

function registrationErrorMessage(error: unknown) {
    if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as {
            response?: { data?: { detail?: unknown } };
        }).response;
        const detail = response?.data?.detail;

        if (typeof detail === "string" && detail.trim() !== "") {
            return detail;
        }
    }

    return "Registration failed. Please check your details and try again.";
}

export default function RegisterPage() {
    const navigate = useNavigate();
    const register = useRegister();

    const [form, setForm] = useState<RegisterForm>({
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [validationError, setValidationError] = useState<string | null>(null);

    function handleChange(field: keyof RegisterForm, value: string) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setValidationError(null);

        if (form.password !== form.confirmPassword) {
            setValidationError("Passwords do not match.");
            return;
        }

        if (form.password.length < 8) {
            setValidationError("Password must contain at least 8 characters.");
            return;
        }

        if (new TextEncoder().encode(form.password).length > 72) {
            setValidationError("Password must be at most 72 bytes.");
            return;
        }

        try {
            await register.mutateAsync({
                email: form.email,
                password: form.password,
            });

            navigate("/login");
        } catch {
            // The mutation exposes the error through register.error.
        }
    }

    const errorMessage =
        validationError ??
        (register.isError ? registrationErrorMessage(register.error) : null);

    return (
        <Card className="border-0 shadow-sm">
            <Card.Body className="p-4 p-md-5">
                <Stack gap={4}>
                    <div className="text-center">
                        <h1 className="h3 fw-bold mb-2">
                            Create an account
                        </h1>
                        <p className="text-body-secondary mb-0">
                            Get started with Finance Tracker.
                        </p>
                    </div>

                    {errorMessage && (
                        <Alert
                            variant="danger"
                            className="mb-0"
                            role="alert"
                        >
                            {errorMessage}
                        </Alert>
                    )}

                    <Form onSubmit={handleSubmit}>
                        <Stack gap={3}>
                            <Form.Group controlId="registerEmail">
                                <Form.Label>Email address</Form.Label>
                                <Form.Control
                                    type="email"
                                    autoComplete="email"
                                    placeholder="you@example.com"
                                    value={form.email}
                                    onChange={(event) =>
                                        handleChange("email", event.target.value)
                                    }
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="registerPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="At least 8 characters"
                                    value={form.password}
                                    onChange={(event) =>
                                        handleChange("password", event.target.value)
                                    }
                                    minLength={8}
                                    required
                                />
                            </Form.Group>

                            <Form.Group controlId="registerConfirmPassword">
                                <Form.Label>Confirm password</Form.Label>
                                <Form.Control
                                    type="password"
                                    autoComplete="new-password"
                                    placeholder="Re-enter your password"
                                    value={form.confirmPassword}
                                    onChange={(event) =>
                                        handleChange(
                                            "confirmPassword",
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                            </Form.Group>

                            <Button
                                type="submit"
                                className="w-100 mt-2"
                                disabled={register.isPending}
                            >
                                {register.isPending
                                    ? "Creating account..."
                                    : "Create account"}
                            </Button>
                        </Stack>
                    </Form>

                    <p className="text-center text-body-secondary mb-0">
                        Already have an account?{" "}
                        <Link to="/login">Sign in</Link>
                    </p>
                </Stack>
            </Card.Body>
        </Card>
    );
}
