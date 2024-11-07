/* eslint-disable react/prop-types */

export default function Button({ size, text, icon, className, type, onClick, disabled }) {
  const sizeClasses = {
    xs: 'px-2 text-xs h-7',
    s: 'px-2 text-xs h-8',
    m: 'px-3 text-sm h-9',
    l: 'px-4 text-base h-11',
    xl: 'px-5 text-lg h-12'
  };

  const typeClasses = {
    primary: 'bg-primary-500 text-textBg-100 hover:bg-primary-600',
    secondary: 'bg-textBg-100 border border-primary-500 text-primary-500',
    tertiary: 'bg-primary-100 text-primary-500',
    link: 'text-primary-500 underline'
  };

  const disabledClasses = disabled
  ? 'opacity-50 cursor-not-allowed'
  : '';

  const sizeClass = sizeClasses[size] || sizeClasses.m;
  const typeClass = typeClasses[type] || typeClasses.primary;

  return icon ? (
    <button 
      className={`rounded flex items-center justify-center gap-2 ${sizeClass} ${typeClass} ${className}`}
      onClick={onClick}
    >
      {icon}
    </button>
  ) : icon && text ? (
    <button 
      className={`min-w-36 rounded flex items-center justify-center gap-2 ${sizeClass} ${typeClass} ${className}`}
      onClick={onClick}
    > 
      {icon}
      {text}
    </button>
  ) :(
    <button 
    className={`min-w-36 rounded flex items-center justify-center gap-2 ${sizeClass} ${typeClass} ${className} ${disabledClasses}`}
    onClick={onClick}
    disabled={disabled}
    > 
      {text}
    </button>
  );
}

