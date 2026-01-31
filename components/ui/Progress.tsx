interface ProgressProps {
    value: number; // 0-100
    className?: string;
}

export function Progress({ value, className = "" }: ProgressProps) {
    // Clamp value between 0 and 100
    const clampedValue = Math.min(100, Math.max(0, value));

    return (
        <div className={`relative h-2 w-full overflow-hidden rounded-full bg-card-nested  ${className}`}>
            <div
                className="h-full bg-accent transition-all duration-300 ease-in-out rounded-full"
                style={{ width: `${clampedValue}%` }}
            />
        </div>
    );
}
