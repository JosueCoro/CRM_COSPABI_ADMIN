import React from 'react';
import { twMerge } from 'tailwind-merge';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, leftIcon, rightIcon, ...props }, ref) => {
        return (
            <div className="w-full">
                {label && (
                    <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {leftIcon && (
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 group-focus-within:text-crm-500 transition-colors">
                            {leftIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={twMerge(
                            'w-full bg-white border border-gray-200 rounded-xl py-3 px-4 text-gray-900 placeholder:text-gray-400',
                            'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-crm-500/20 focus:border-crm-500',
                            'disabled:bg-gray-50 disabled:text-gray-500',
                            error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
                            leftIcon && 'pl-10',
                            rightIcon && 'pr-10',
                            className
                        )}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="mt-1.5 text-sm text-red-600 font-medium ml-1 flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-red-600 block" />
                        {error}
                    </p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
