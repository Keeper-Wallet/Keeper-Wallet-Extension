import * as React from 'react';
import * as styles from './error.styl';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

const Errors = ({
  errors,
  show,
}: {
  errors: Array<{ key: string; msg: string }>;
  show: boolean;
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
  show?: boolean;
  children?: React.ReactNode;
  className?: string;
  hideByClick?: boolean;
  onClick?: (...args) => void;
  errors?: Array<{ code: number; key: string; msg: string }>;
}

interface State {
  showed: boolean;
}

export class Error extends React.PureComponent<Props> {
  props: Props;
  state: State = { showed: false };

  static getDerivedStateFromProps(props: Props, state: State): State | null {
    const { showed } = state;
    const { show } = props;

    if (!state || showed != show) {
      return { ...state, showed: show };
    }

    return null;
  }

  onClick = e => this._onClick(e);

  render() {
    const { showed } = this.state;

    const {
      children,
      className = '',
      errors,
      type,
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

  _onClick(e) {
    if (this.props.onClick) {
      this.props.onClick(e);
      return null;
    }

    if (this.props.hideByClick) {
      this.setState({ hidden: true });
    }
  }
}
