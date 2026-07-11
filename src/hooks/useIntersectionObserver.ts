import { useEffect, useState, useRef, MutableRefObject } from 'react';

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

export function useIntersectionObserver(options: IntersectionObserverOptions = {}): {
  ref: MutableRefObject<HTMLDivElement | null>;
  isIntersecting: boolean;
} {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [options.rootMargin, options.threshold]); // Omit root to prevent excessive re-renders unless specified

  return { ref, isIntersecting };
}
