/**
 * Runs `action` and returns any error React reported through the window
 * "error" event.
 *
 * React 19 does not rethrow errors thrown by DOM event handlers, so a test
 * that only wraps `fireEvent` in `expect(...).not.toThrow()` passes while the
 * handler is actually crashing. The listener also calls preventDefault() so
 * jsdom does not forward the error to Vitest as an unhandled exception.
 */
export async function uncaughtErrorsFrom(action: () => void) {
    const errors: unknown[] = [];

    const onError = (event: ErrorEvent) => {
        errors.push(event.error ?? event.message);
        event.preventDefault();
    };

    window.addEventListener("error", onError);

    try {
        action();
        // React reports handler errors asynchronously.
        await new Promise((resolve) => setTimeout(resolve, 0));
    } finally {
        window.removeEventListener("error", onError);
    }

    return errors;
}
