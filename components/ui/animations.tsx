"use client";

import { useState, useEffect, useRef } from "react";

// ─── Custom Hook: Count Up Animation ────────────────────────────────
export function useCountUp(end: number, duration: number = 1800, decimals: number = 0, startDelay: number = 0) {
    const [value, setValue] = useState(0);
    const frameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        setValue(0);
        startTimeRef.current = null;

        const timeout = setTimeout(() => {
            const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

            const animate = (timestamp: number) => {
                if (!startTimeRef.current) startTimeRef.current = timestamp;
                const elapsed = timestamp - startTimeRef.current;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = easeOutExpo(progress);

                const currentValue = easedProgress * end;
                setValue(decimals > 0 ? parseFloat(currentValue.toFixed(decimals)) : Math.floor(currentValue));

                if (progress < 1) {
                    frameRef.current = requestAnimationFrame(animate);
                } else {
                    setValue(decimals > 0 ? parseFloat(end.toFixed(decimals)) : end);
                }
            };

            frameRef.current = requestAnimationFrame(animate);
        }, startDelay);

        return () => {
            clearTimeout(timeout);
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
        };
    }, [end, duration, decimals, startDelay]);

    return value;
}

// ─── Custom Hook: Intersection Observer ──────────────────────────────
export function useInView(threshold: number = 0.1) {
    const ref = useRef<HTMLDivElement>(null);
    const [isInView, setIsInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.unobserve(element);
                }
            },
            { threshold }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [threshold]);

    return { ref, isInView };
}

// ─── Animated Number Component ───────────────────────────────────────
export function AnimatedNumber({
    value,
    decimals = 0,
    delay = 0,
    className,
    suffix,
}: {
    value: number;
    decimals?: number;
    delay?: number;
    className?: string;
    suffix?: string;
}) {
    const animatedValue = useCountUp(value, 2000, decimals, delay);
    return (
        <span className={className}>
            {decimals > 0 ? animatedValue.toFixed(decimals) : animatedValue}
            {suffix}
        </span>
    );
}

// ─── Animated Section Wrapper ────────────────────────────────────────
export function AnimatedSection({
    children,
    delay = 0,
    className = "",
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const { ref, isInView } = useInView(0.1);
    const [hasAnimated, setHasAnimated] = useState(false);

    useEffect(() => {
        if (isInView) {
            const timeout = setTimeout(() => setHasAnimated(true), delay);
            return () => clearTimeout(timeout);
        }
    }, [isInView, delay]);

    return (
        <div
            ref={ref}
            className={className}
            style={{
                opacity: hasAnimated ? 1 : 0,
                transform: hasAnimated ? "translateY(0)" : "translateY(30px)",
                transition: "opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
        >
            {children}
        </div>
    );
}

// ─── Animated Table Row ──────────────────────────────────────────────
export function AnimatedTableRow({
    children,
    index = 0,
    className = "",
}: {
    children: React.ReactNode;
    index?: number;
    className?: string;
}) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setIsVisible(true), Math.min(index * 40, 600));
        return () => clearTimeout(timeout);
    }, [index]);

    return (
        <tr
            className={className}
            style={{
                opacity: isVisible ? 1 : 0,
                transform: isVisible ? "translateX(0)" : "translateX(-15px)",
                transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
            }}
        >
            {children}
        </tr>
    );
}
