import * as React from 'react';

interface Props
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLSpanElement>,
    HTMLSpanElement
  > {
  onClick: () => void;
}

/*
 * NOTE:
 * This component is needed to allow text inside the button to wrap, like simple
 * text of inline elements, to use it inside e.g. error messages
 */
export function InlineButton({ onClick, ...otherProps }: Props) {
  return (
    <span
      role="button"
      tabIndex={0}
      {...otherProps}
      onClick={() => {
        onClick();
      }}
      onKeyUp={event => {
        if (['Enter', ' '].includes(event.key)) {
          onClick();
        }
      }}
    />
  );
}
