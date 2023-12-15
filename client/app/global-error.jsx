"use client";
import { useEffect } from "react";
import { Button } from "antd";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
        >
          <h2>Something went wrong!</h2>
          <Button type="primary" onClick={reset}>
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
