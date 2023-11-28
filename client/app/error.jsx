'use client';

import { useEffect } from 'react';
import { Button } from 'antd';

export default function Err({ error, reset }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem',
      }}
    >
      <h2>Something went wrong!</h2>
      <Button
        type="primary"
        onClick={reset}
      >
        Try again
      </Button>
    </div>
  );
}