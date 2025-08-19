
import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface LoadingScreenProps {
    message: string;
}

export function LoadingScreen({ message }: LoadingScreenProps): React.ReactNode {
    return (
        <div className="flex flex-col items-center justify-center text-center p-8">
            <LoadingSpinner />
            <p className="text-xl mt-4 text-slate-600 dark:text-slate-300 animate-pulse">{message}</p>
        </div>
    );
}
