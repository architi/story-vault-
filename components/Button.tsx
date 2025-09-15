import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  children: React.ReactNode;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', className = '', ...props }) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 px-6 py-3 font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--background-primary)] transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md';

  const variantClasses = {
    primary: 'bg-[var(--accent-primary)] text-white hover:bg-[var(--accent-secondary)] focus:ring-[var(--accent-primary)]',
    secondary: 'bg-transparent border-2 border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-white focus:ring-[var(--accent-primary)]',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

export default Button;