import cn from 'classnames';
import { PureComponent } from 'react';
import { useTranslation } from 'react-i18next';

import * as styles from './error.styl';

const Errors = ({
  errors,
  show,
}: {
  errors: Array<{ key: string; msg: string }> | undefined;
  show: unknown;
}) => {
  const { t } = useTranslation();

  if (!show || !errors || !errors.length) {
    return null;
  }

  return (
    <>
      {errors.map(({ key, msg }) => {
        key = key.replace(/\s/g, '');
        return t(key, { defaultValue: msg, key });
      })}
    </>
  );
};

interface Props {
  type?: string;
  show?: unknown;
  children?: React.ReactNode;
  className?: string;
  hideByClick?: boolean;
  onClick?: (...args: unknown[]) => void;
  errors?: Array<{ code: number; key: string; msg: string }>;
}

interface State {
  hidden?: boolean;
  showed: unknown;
}

export class ErrorMessage extends PureComponent<Props, State> {
  state: State = { showed: false };

  static getDerivedStateFromProps(props: Props, state: State): State | null {
    const { showed } = state;
    const { show } = props;

    // eslint-disable-next-line eqeqeq
    if (!state || showed != show) {
      return { ...state, showed: show };
    }

    return null;
  }

  onClick = (e: unknown) => this._onClick(e);

  render() {
    const { showed } = this.state;

    const {
      children,
      className = '',
      errors,
      type,
      show,
      ...otherProps
    } = this.props;

    if (type === 'modal') {
      return null;
    }

    return (
      <div
        className={cn(styles.error, className, {
          [styles.modalError]: type && type === 'modal',
        })}
        onClick={this.onClick}
        {...otherProps}
      >
        <Errors errors={errors} show={showed} />
        {showed ? children : null}
      </div>
    );
  }

  _onClick(e: unknown) {
    if (this.props.onClick) {
      this.props.onClick(e);
      return null;
    }

    if (this.props.hideByClick) {
      this.setState({ hidden: true });
    }
  }
}
