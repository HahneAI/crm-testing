import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  footer?: ReactNode;
  hover?: boolean;
}

const Card = ({ 
  children, 
  title, 
  subtitle,
  className = '', 
  footer,
  hover = false,
}: CardProps) => {
  return (
    <div 
      className={`
        bg-white dark:bg-gray-800 
        rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 
        overflow-hidden 
        ${hover ? 'transition-all duration-200 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600' : ''}
        ${className}
      `}
    >
      {(title || subtitle) && (
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          {title && <h3 className="text-lg font-medium text-gray-900 dark:text-white">{title}</h3>}
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
      )}
      
      <div className="p-5">{children}</div>
      
      {footer && (
        <div className="px-5 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;