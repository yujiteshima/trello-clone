import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

function Card({ children, className = '', onClick }: CardProps) {
    return (
        <div
            className={`bg-white dark:bg-gray-800 dark:text-gray-100 rounded-md shadow-sm p-4 break-words overflow-hidden max-w-full ${className}`}
            onClick={onClick}
        >
            {children}
        </div>
    );
}

export default Card; 