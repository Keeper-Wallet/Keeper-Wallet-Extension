import * as React from 'react';

interface IProps {
    text: string;
    className?: string;
    size?: number;
}

export const Ellipsis = ({ text, className, size = 8 }: IProps) => {
    return (
        <div className={className}>
            {text.slice(0, size)}...{text.slice(-size)}
        </div>
    );
};
