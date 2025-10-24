"use client";
import { useState, useEffect, useRef, useCallback } from "react";

const useCounter = (
  end: number,
  duration: number = 2000,
  startCounting: boolean
): number => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (!startCounting) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(easeOutQuart * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration, startCounting]);

  return count;
};

interface CounterProps {
  end?: number;
  duration?: number;
  className?: string;
}

const Counter: React.FC<CounterProps> = ({
  end = 2465,
  duration = 2000,
  className = "font-bold text-2xl",
}) => {
  const [isInView, setIsInView] = useState<boolean>(false);
  const counterRef = useRef<HTMLHeadingElement>(null);
  const count = useCounter(end, duration, isInView);

  // Create a stable callback for the intersection observer
  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        setIsInView(true);
      }
    },
    []
  );

  useEffect(() => {
    const currentRef = counterRef.current;
    if (!currentRef) return;

    const observer = new IntersectionObserver(handleIntersection, {
      threshold: 0.1,
    });

    observer.observe(currentRef);

    return () => {
      observer.disconnect();
    };
  }, [handleIntersection]);

  return (
    <h1 ref={counterRef} className={className}>
      {count}+
    </h1>
  );
};

export default Counter;
