'use client';

import { useEffect } from 'react';

export default function Error({ error, reset, ...rest }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {}, [error]);

  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  );
}
