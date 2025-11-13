import { useEffect, useRef, useState } from 'react';

// Simple IntersectionObserver hook that returns a ref and a boolean indicating
// whether the element is in view. Options mirror IntersectionObserverInit.
export function useInView<T extends Element>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setInView(entry.isIntersecting);
      });
    }, options);

    observer.observe(el);

    return () => observer.disconnect();
    // We intentionally stringify threshold to make it a stable dependency
    // while keeping the signature simple. root and rootMargin are primitives.
  }, [ref, options?.root, options?.rootMargin, JSON.stringify(options?.threshold)]);

  return { ref, inView } as const;
}

export default useInView;
