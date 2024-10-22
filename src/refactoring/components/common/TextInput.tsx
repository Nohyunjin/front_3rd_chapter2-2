import { InputHTMLAttributes, useState } from 'react';

interface TextInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  label: string;
  value: string | number | readonly string[] | undefined;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string;
  hideLabelOnPlaceholder?: boolean; // 새로운 prop 추가
}

export const TextInput = ({
  label,
  value,
  onChange,
  id,
  errorMessage,
  required = false,
  className = '',
  type = 'text',
  placeholder,
  hideLabelOnPlaceholder = false, // 기본값 false
  ...restProps
}: TextInputProps) => {
  const [isFocused, setIsFocused] = useState(false);

  // value가 비어있는지 체크하는 함수 추가
  const isEmpty = value === '' || value === undefined || value === null;
  const showLabel =
    !hideLabelOnPlaceholder || !placeholder || isFocused || !isEmpty;

  return (
    <div className='relative'>
      <input
        id={id}
        value={value}
        type={type}
        onChange={onChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className={`
          peer
          w-full
          h-12
          px-3
          ${showLabel ? 'pt-5' : 'pt-3'}
          border
          rounded
          outline-none
          transition-all
          focus:border-blue-500
          ${errorMessage ? 'border-red-500' : 'border-gray-300'}
          ${className}
        `}
        placeholder={placeholder}
        required={required}
        {...restProps}
      />
      {showLabel && (
        <label
          htmlFor={id}
          className={`
            absolute
            left-3
            transition-all
            pointer-events-none
            ${!isEmpty || isFocused ? 'text-xs top-1' : 'text-base top-3'}
            ${
              errorMessage
                ? 'text-red-500'
                : isFocused
                ? 'text-blue-500'
                : 'text-gray-500'
            }
          `}
        >
          {label}
        </label>
      )}
      {errorMessage && (
        <p className='mt-1 text-xs text-red-500'>{errorMessage}</p>
      )}
    </div>
  );
};