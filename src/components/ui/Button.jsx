const variants = {
  primary: 'bg-portfolio-white text-portfolio-black hover:bg-portfolio-light active:bg-portfolio-gray',
  secondary: 'bg-portfolio-elevated text-portfolio-white hover:bg-portfolio-muted active:bg-portfolio-border',
  danger: 'bg-portfolio-white text-portfolio-black hover:bg-portfolio-light',
  ghost: 'bg-transparent text-portfolio-light hover:bg-portfolio-elevated',
  outline: 'border-2 border-portfolio-white text-portfolio-white hover:bg-portfolio-white hover:text-portfolio-black',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm font-medium',
  lg: 'px-6 py-3 text-base font-semibold',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={`inline-flex items-center justify-center rounded-xl transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
