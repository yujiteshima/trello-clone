import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

function Input({
    label,
    error,
    className = '',
    fullWidth = false,
    ...props
}: InputProps) {
    return (
        <div className={`mb-4 ${fullWidth ? 'w-full' : ''}`}>
            {label && (
                <label className="block text-gray-700 text-sm font-medium mb-1">
                    {label}
                </label>
            )}
            <input
                className={`border rounded-md py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500 ${error ? 'border-red-500' : 'border-gray-300'
                    } ${fullWidth ? 'w-full' : ''} ${className}`}
                {...props}
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
    );
}

export default Input; 