import { useState, useCallback } from 'react';

export function usePagination(initialLimit = 10, step = 10) {
  const [limit, setLimit] = useState(initialLimit);

  const loadMore = useCallback(() => {
    setLimit((prev) => prev + step);
  }, [step]);

  return { limit, loadMore };
}
