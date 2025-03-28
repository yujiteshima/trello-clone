import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    fullWidth?: boolean;
}

function Button({
    children,
    className,
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    ...props
}: ButtonProps) {
    const baseClasses = "font-medium rounded focus:outline-none transition-colors";

    const variantClasses = {
        primary: "bg-blue-600 hover:bg-blue-700 text-white",
        secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200",
        danger: "bg-red-600 hover:bg-red-700 text-white",
    };

    const sizeClasses = {
        sm: "py-1 px-2 text-sm",
        md: "py-2 px-4",
        lg: "py-3 px-6 text-lg",
    };

    const widthClass = fullWidth ? "w-full" : "";

    return (
        <button
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className || ''}`}
            {...props}
        >
            {children}
        </button>
    );
}

export default Button; 