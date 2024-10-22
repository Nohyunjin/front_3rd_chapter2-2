interface ButtonProps {
  dataTestid?: string;
  text: string;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}

export const Button = ({
  dataTestid,
  text,
  className,
  onClick,
  disabled,
}: ButtonProps) => {
  return (
    <button
      data-testid={dataTestid}
      className={
        !disabled ? className : 'bg-gray-500 text-white px-2 py-1 rounded mt-2'
      }
      onClick={onClick}
      disabled={disabled}
    >
      {text}
    </button>
  );
};
