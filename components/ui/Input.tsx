/**
 * Input Component
 * Styled input field with neon theme
 */

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    /** Error message to display */
    error?: string;
    /** Label for the input */
    label?: string;
    /** Helper text below input */
    helperText?: string;
    /** Icon to display on left side */
    leftIcon?: React.ReactNode;
    /** Icon to display on right side */
    rightIcon?: React.ReactNode;
}

// =============================================================================
// COMPONENT
// =============================================================================

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type,
            error,
            label,
            helperText,
            leftIcon,
            rightIcon,
            disabled,
            id,
            ...props
        },
        ref
    ) => {
        const inputId = id ?? React.useId();
        const hasError = !!error;

        return (
            <div className="w-full">
                {/* Label */}
                {label && (
                    <label
                        htmlFor={inputId}
                        className="block text-sm font-medium text-gray-300 mb-2"
                    >
                        {label}
                    </label>
                )}

                {/* Input wrapper */}
                <div className="relative">
                    {/* Left icon */}
                    {leftIcon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {leftIcon}
                        </div>
                    )}

                    {/* Input field */}
                    <input
                        type={type}
                        id={inputId}
                        ref={ref}
                        disabled={disabled}
                        className={cn(
                            // Base styles
                            'flex h-11 w-full rounded-xl bg-white/5 px-4 py-2 text-sm text-white',
                            'placeholder:text-gray-500',
                            'transition-all duration-200',
                            // Border
                            'border',
                            hasError
                                ? 'border-red-500/50 focus:border-red-500'
                                : 'border-white/10 focus:border-neon-500/50',
                            // Focus state
                            'focus:outline-none focus:ring-1',
                            hasError ? 'focus:ring-red-500/50' : 'focus:ring-neon-500/50',
                            // Disabled state
                            'disabled:opacity-50 disabled:cursor-not-allowed',
                            // Icon padding adjustments
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        aria-invalid={hasError}
                        aria-describedby={
                            hasError ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
                        }
                        {...props}
                    />

                    {/* Right icon */}
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
                            {rightIcon}
                        </div>
                    )}
                </div>

                {/* Error message */}
                {hasError && (
                    <p
                        id={`${inputId}-error`}
                        className="mt-1.5 text-xs text-red-400"
                        role="alert"
                    >
                        {error}
                    </p>
                )}

                {/* Helper text */}
                {!hasError && helperText && (
                    <p id={`${inputId}-helper`} className="mt-1.5 text-xs text-gray-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// =============================================================================
// TEXTAREA COMPONENT
// =============================================================================

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: string;
    label?: string;
    helperText?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, error, label, helperText, disabled, id, ...props }, ref) => {
        const textareaId = id ?? React.useId();
        const hasError = !!error;

        return (
            <div className="w-full">
                {label && (
                    <label
                        htmlFor={textareaId}
                        className="block text-sm font-medium text-gray-300 mb-2"
                    >
                        {label}
                    </label>
                )}

                <textarea
                    id={textareaId}
                    ref={ref}
                    disabled={disabled}
                    className={cn(
                        'flex min-h-[100px] w-full rounded-xl bg-white/5 px-4 py-3 text-sm text-white',
                        'placeholder:text-gray-500 resize-none',
                        'transition-all duration-200',
                        'border',
                        hasError
                            ? 'border-red-500/50 focus:border-red-500'
                            : 'border-white/10 focus:border-neon-500/50',
                        'focus:outline-none focus:ring-1',
                        hasError ? 'focus:ring-red-500/50' : 'focus:ring-neon-500/50',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        className
                    )}
                    aria-invalid={hasError}
                    {...props}
                />

                {hasError && (
                    <p className="mt-1.5 text-xs text-red-400" role="alert">
                        {error}
                    </p>
                )}

                {!hasError && helperText && (
                    <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';

export { Input, Textarea };
export default Input;
