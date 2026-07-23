"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: "100vh",
            display: "grid",
            placeItems: "center",
            fontFamily: "system-ui, sans-serif",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.25rem", marginBottom: "0.5rem" }}>
              Something went wrong
            </h1>
            <p style={{ color: "#64748b", marginBottom: "1rem" }}>
              An unexpected error occurred. You can try again.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                borderRadius: "0.5rem",
                border: "1px solid #cbd5e1",
                background: "#fff",
                padding: "0.5rem 1rem",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
