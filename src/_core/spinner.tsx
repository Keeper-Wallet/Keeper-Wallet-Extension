import * as styles from './spinner.module.css';

interface Props {
  size: number;
}

const CANVAS_SIZE = 16;
const CENTER = CANVAS_SIZE / 2;
const STROKE_WIDTH = 2;
const RADIUS = CANVAS_SIZE / 2 - STROKE_WIDTH / 2;
const PATH_LENGTH = 2 * Math.PI * RADIUS;

export function Spinner({ size }: Props) {
  return (
    <svg
      className={styles.root}
      width={size}
      height={size}
      viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
    >
      <circle
        className={styles.circle}
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        strokeWidth={STROKE_WIDTH}
        style={{
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ['--path-length' as any]: `${PATH_LENGTH}px`,
        }}
      />
    </svg>
  );
}
