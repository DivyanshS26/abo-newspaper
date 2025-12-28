// app/components/common/Button.tsx
'use client';

import React from 'react';

interface ButtonProps {
    children: React.ReactNode;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline';
    disabled?: boolean;
    fullWidth?: boolean;
    className?: string;
    title?: string;
}

export default function Button({
                                   children,
                                   onClick,
                                   type = 'button',
                                   variant = 'primary',
                                   disabled = false,
                                   fullWidth = false,
                                   className = '',
                                   title,
                               }: ButtonProps) {

    const baseStyles = 'px-6 py-3 font-serif font-bold uppercase tracking-wide transition-all duration-200 border-2';

    const variantStyles = {
        primary: 'bg-border text-paper border-border hover:bg-ink hover:border-ink disabled:bg-gray-400',
        secondary: 'bg-gold text-ink border-gold hover:bg-yellow-600 hover:border-yellow-600 disabled:bg-gray-300',
        outline: 'bg-transparent text-border border-border hover:bg-border hover:text-paper disabled:border-gray-400',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`${baseStyles} ${variantStyles[variant]} ${widthStyle} ${className} disabled:cursor-not-allowed disabled:opacity-50`}
        >
            {children}
        </button>
    );
}
