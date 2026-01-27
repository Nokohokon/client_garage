interface UsersIconProps {
    className?: string;
}

export function UsersIcon({ className = "w-12 h-12" }: UsersIconProps) {
    return (
        <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            {/* Hintere Person (heller) */}
            <circle cx="44" cy="18" r="10" fill="currentColor" opacity="0.5" />
            <path
                d="M44 32c-11 0-20 7-20 16v4h40v-4c0-9-9-16-20-16z"
                fill="currentColor"
                opacity="0.5"
            />
            
            {/* Vordere Person (volle Farbe) */}
            <circle cx="24" cy="24" r="12" fill="currentColor" />
            <path
                d="M24 40c-13 0-24 8-24 18v6h48v-6c0-10-11-18-24-18z"
                fill="currentColor"
            />
        </svg>
    );
}
