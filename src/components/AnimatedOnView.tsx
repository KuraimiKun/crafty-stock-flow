import React, { useEffect, useState } from 'react';
import { useInView } from '@/hooks/useInView';

type AnimatedOnViewProps = {
  children: React.ReactNode;
  className?: string;
  // Tailwind utility classes for the initial (hidden) state and the enter state
  initialClass?: string;
  enterClass?: string;
  threshold?: number;
  rootMargin?: string;
  // If true, animation will run only once when element first appears
  once?: boolean;
};

export const AnimatedOnView: React.FC<AnimatedOnViewProps> = ({
  children,
  className = '',
  initialClass = 'opacity-0 translate-y-6',
  enterClass = 'opacity-100 translate-y-0',
  threshold = 0.12,
  rootMargin = '0px',
  // when `once` is false the animation will replay every time the element
  // enters the viewport; set to `true` to run only on the first entrance.
  once = false,
}) => {
  const { ref, inView } = useInView<HTMLElement>({ threshold, rootMargin });
  const [shown, setShown] = useState(false);

  useEffect(() => {
    if (inView) setShown(true);
  }, [inView]);

  const show = once ? shown : inView;

  return (
    <div
      ref={ref as any}
      className={`${className} transform transition-opacity transition-transform duration-700 ease-out ${
        show ? enterClass : initialClass
      }`}
    >
      {children}
    </div>
  );
};

export default AnimatedOnView;
