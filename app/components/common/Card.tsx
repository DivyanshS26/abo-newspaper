// app/components/common/Card.tsx
import React from 'react';

interface CardProps {
    children: React.ReactNode;
    title?: string;
    className?: string;
}

export default function Card({ children, title, className = '' }: CardProps) {
    return (
        <div className={`bg-paper border-4 border-border shadow-lg p-6 ${className}`}>
            {title && (
                <>
                    <h2 className="text-2xl font-bold uppercase tracking-wider text-center mb-2">
                        {title}
                    </h2>
                    <div className="ornamental-divider"></div>
                </>
            )}
            {children}
        </div>
    );
}
