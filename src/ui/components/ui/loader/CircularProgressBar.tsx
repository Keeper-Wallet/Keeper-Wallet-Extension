import * as React from 'react';
import { CircleProgressBar } from './circle-progress-bar';

export class CircularProgressbar extends React.PureComponent {
  readonly props: IProps;
  drawer: CircleProgressBar;
  canvas: HTMLCanvasElement;

  getRef = (el: HTMLCanvasElement) => (this.canvas = el);

  constructor(props: IProps) {
    super(props);
  }

  componentDidMount(): void {
    this.drawer = new CircleProgressBar(this.canvas, {
      colors: this.props.colors,
      radius: this.props.size / 2 - this.props.strokeWidth,
      lineWidth: this.props.strokeWidth,
      lineCap: this.props.lineCap,
      trackLineColor: this.props.trackLineColor,
    });
  }

  componentWillUpdate(nextProps: IProps): void {
    this.drawer.setValue((nextProps.percent % 100) / 100);
  }

  render() {
    const canvasProps = {
      className: this.props.className,
      width: this.props.size,
      height: this.props.size,
    };
    return <canvas {...canvasProps} ref={this.getRef}></canvas>;
  }
}

interface IProps {
  percent: number;
  className?: string;
  strokeWidth?: number;
  size?: number;
  colors?: Array<string>;
  lineCap?: string;
  trackLineColor?: string;
}
