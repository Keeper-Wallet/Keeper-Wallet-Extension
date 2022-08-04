import * as React from 'react';

interface IProps {
  text: string | null | undefined;
  className?: string;
  size?: number;
}

export const Ellipsis = ({ text, className, size = 8 }: IProps) => {
  return (
    <div className={className} title={text as string | undefined}>
      {text && text.length > 2 * size
        ? `${text.slice(0, size)}...${text.slice(-size)}`
        : text}
    </div>
  );
};
