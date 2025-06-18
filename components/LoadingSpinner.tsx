
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string; 
  text?: string;
  textColor?: string; 
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'text-sky-600', 
  text,
  textColor = 'text-slate-600'
}) => {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-[6px]',
  };

  return (
    <div className="flex flex-col items-center justify-center my-8" role="status" aria-live="polite">
      <div 
        className={`animate-spin rounded-full ${sizeClasses[size]} ${color} border-t-transparent`}
        style={{ borderTopColor: 'transparent' }} 
      >
      </div>
      {text && <p className={`mt-3 text-sm ${textColor}`}>{text}</p>}
      {!text && <span className="sr-only">Loading...</span>}
    </div>
  );
};

export default LoadingSpinner;
