// app/components/common/Input.tsx
'use client';

import React from 'react';

interface InputProps {
    label: string;
    id: string;
    type?: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
}

export default function Input({
                                  label,
                                  id,
                                  type = 'text',
                                  value,
                                  onChange,
                                  placeholder = '',
                                  required = false,
                                  error = '',
                                  disabled = false,
                              }: InputProps) {
    return (
        <div className="mb-4">
            <label htmlFor={id} className="block text-sm font-bold mb-2 uppercase tracking-wide">
                {label} {required && <span className="text-red-600">*</span>}
            </label>
            <input
                id={id}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                className={`w-full px-4 py-3 border-2 bg-paper text-ink font-mono focus:outline-none focus:ring-2 focus:ring-gold transition-all ${
                    error ? 'border-red-500' : 'border-border'
                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
            {error && <p className="text-red-600 text-sm mt-1 font-sans">{error}</p>}
        </div>
    );
}
