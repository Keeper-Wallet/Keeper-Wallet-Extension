import { createElement } from 'react';
import { useNavigate } from 'react-router-dom';

export interface WithNavigate {
  navigate: ReturnType<typeof useNavigate>;
}

export function withNavigate<Props>(
  component: React.ComponentType<Props & WithNavigate>,
): React.ComponentType<Props> {
  return function WrappedWithNavigate(props) {
    return createElement(component, {
      ...props,
      navigate: useNavigate(),
    });
  };
}
